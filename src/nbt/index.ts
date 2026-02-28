import { StructureDSL } from './dsl';
import type { MidiFile } from 'midifile-ts';
import type { BPM, NoteSimple } from './types';

const tickToMs = (tick: number, bpm: BPM[], ppq: number) => {
  let result = 0;

  for (let i = 0; i < bpm.length; i++) {
    const t1 = bpm[i];
    const t2 = bpm[i + 1] ?? { tick: tick };

    if (tick <= t1.tick) break;

    const startTick = t1.tick;
    const endTick = Math.min(t2.tick, tick);
    const deltaTick = endTick - startTick;

    const secPerBeat = t1.microsecondsPerBeat / 1_000_000;
    result += (deltaTick / ppq) * secPerBeat * 1000;
  }

  return result;
};

const generateClockBlock = (dsl: StructureDSL, width: number, y: number, z: number) => {
  dsl.fill(
    { x: 0, y: y + 1, z: z },
    { x: width - 1, y: y + 1, z: z },
    'setblock ~ ~1 ~ minecraft:air',
    'down'
  );

  dsl.fill(
    { x: 0, y: y, z: z },
    { x: width - 1, y: y, z: z },
    (index) => {
      let command = 'setblock ~1 ~2 ~ minecraft:redstone_block';
      if (index + 1 >= width) command = `setblock ~-${width - 1} ~2 ~1 minecraft:redstone_block`;

      return {
        command,
        facing: 'down',
        type: 'chain',
      };
    }
  );
};

export const generateNbt = (
  midi: MidiFile,
  maxDepth: number,
  maxWidth: number,
  tickrate: number = 20,
) => new Promise<Uint8Array<ArrayBuffer>>((res, rej) => {
  // Parse MIDI
  const ppq = midi.header.ticksPerBeat;
  const bpm: BPM[] = [];

  {
    for (const track of midi.tracks) {
      let currentTick = 0;
      for (const event of track) {
        currentTick += event.deltaTime;

        if (event.type !== 'meta') continue;
        if (event.subtype !== 'setTempo') continue;

        const mpb = event.microsecondsPerBeat;
        bpm.push({
          tick: currentTick,
          microsecondsPerBeat: mpb,
          bpm: 60_000_000 / mpb,
        });
      }
    }

    if (bpm.length <= 0) { // This is rare
      bpm.push({
        tick: 0,
        microsecondsPerBeat: 500_000,
        bpm: 120,
      });
    }

    bpm.sort((a, b) => a.tick - b.tick);
  }

  const notesByTick = new Map<number, NoteSimple[]>();
  let noteMinChannel = Infinity;

  {
    const notes: NoteSimple[] = [];
    // FIFO stack per (track, pitch) to match noteOn indices to their noteOff
    const noteOnIndices = new Map<string, number[]>();

    for (let i = 0; i < midi.tracks.length; i++) {
      let currentTick = 0;

      for (const event of midi.tracks[i]) {
        currentTick += event.deltaTime;

        if (event.type !== 'channel') continue;

        const isNoteOn = event.subtype === 'noteOn' && event.velocity > 0;
        const isNoteOff = event.subtype === 'noteOff' ||
          (event.subtype === 'noteOn' && event.velocity === 0);

        if (isNoteOn) {
          noteMinChannel = Math.min(i, noteMinChannel);

          const key = `${i},${event.noteNumber}`;
          if (!noteOnIndices.has(key)) noteOnIndices.set(key, []);
          noteOnIndices.get(key)!.push(notes.length);

          notes.push({
            channel: i,
            time: tickToMs(currentTick, bpm, ppq),
            pitch: event.noteNumber,
            velocity: event.velocity,
            duration: 250, // default; overwritten when noteOff is found
          });
        } else if (isNoteOff) {
          const key = `${i},${event.noteNumber}`;
          const indexStack = noteOnIndices.get(key);
          if (indexStack && indexStack.length > 0) {
            const noteIndex = indexStack.shift()!;
            notes[noteIndex].duration =
              tickToMs(currentTick, bpm, ppq) - notes[noteIndex].time;
          }
        }
      }
    }

    notes.sort((a, b) => a.time - b.time);

    let lastTick = -Infinity;

    for (const note of notes) {
      let mcTick = (note.time / 1000) * tickrate;
      mcTick = Math.round(mcTick / 0.5) * 0.5;

      if (mcTick - lastTick < 1)
        mcTick = lastTick;
      else
        lastTick = mcTick;

      const mcTickInt = Math.round(mcTick);

      if (notesByTick.has(mcTickInt)) {
        const notes = notesByTick.get(mcTickInt)!;
        notes.push(note);
        notes.sort((a, b) => a.pitch - b.pitch);
      } else {
        notesByTick.set(mcTickInt, [ note ]);
      }
    }
  }

  // Generate structure NBT
  const dsl = new StructureDSL;

  {
    const notesTick = [ ...notesByTick.keys() ].sort((a, b) => a - b);
    let currentY = 0;
    let currentZ = 0;
    let currentHighest = 0;
    let layers = 0;
    let layerStartTick = 0;

    for (const tick of notesTick) {
      const notes = notesByTick.get(tick);
      if (!notes || notes.length <= 0) continue;

      let _tick = tick - layerStartTick - (maxDepth * currentZ);

      while (_tick >= maxDepth) {
        generateClockBlock(dsl, maxDepth, currentY, currentZ);

        _tick -= maxDepth;
        currentZ++;

        if (currentZ >= maxWidth) {
          const lastLayerBlock = dsl.getBlock({ x: maxDepth - 1, y: currentY, z: currentZ - 1 });
          console.log(lastLayerBlock);
          if (lastLayerBlock) {
            lastLayerBlock.command = `setblock ~-${maxDepth - 1} ~${currentHighest + 6} ~-${maxWidth - 1} minecraft:redstone_block`;
          }

          currentY += currentHighest + 4;
          layers++;
          layerStartTick = tick;

          currentZ = 0;
          currentHighest = 0;
          _tick = tick - layerStartTick;
        }
      }

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const durationInTicks = Math.max(1, Math.round((note.duration / 1000) * tickrate));

        dsl.block(
          { x: _tick, y: currentY + i + 3, z: currentZ },
          `note ${note.pitch} ${Math.round(note.velocity)} ${note.channel - noteMinChannel} ${durationInTicks}`,  // duration in ticks
          'up',
          i > 0 ? 'chain' : 'normal',
        );
        if (notes.length > currentHighest) currentHighest = notes.length;
      }
    }

    generateClockBlock(dsl, maxDepth, currentY, currentZ);
  }

  dsl.toNBT()
    .then(res)
    .catch(rej);
});
