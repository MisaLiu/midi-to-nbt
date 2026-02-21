import { StructureDSL } from './dsl';
import type { MidiFile, NoteOnEvent } from 'midifile-ts';
import type { BPM } from './types';

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
) => new Promise<Uint8Array<ArrayBuffer>>((res, rej) => {
  const [ metaTrack, ...tracks ] = midi.tracks;

  // Parse MIDI
  const ppq = midi.header.ticksPerBeat;
  const bpm: BPM[] = [];

  {
    let currentTick = 0;
    for (const meta of metaTrack) {
      currentTick += meta.deltaTime;

      if (meta.type !== 'meta') continue;
      if (meta.subtype !== 'setTempo') continue;

      const mpb = meta.microsecondsPerBeat;
      bpm.push({
        tick: currentTick,
        microsecondsPerBeat: mpb,
        bpm: 60_000_000 / mpb, // I don't think we need *that* precise
      });
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

  const notesByTick = new Map<number, NoteOnEvent[]>();

  for (const track of tracks) {
    let currentTick = 0;

    for (const event of track) {
      currentTick += event.deltaTime;

      if (event.type !== 'channel') continue;
      if (event.subtype !== 'noteOn') continue;
      if (event.velocity <= 0) continue;

      const mcTick = Math.round(tickToMs(currentTick, bpm, ppq) * 20 / 1000);

      if (notesByTick.has(mcTick)) {
        const notes = notesByTick.get(mcTick)!;
        if (notes.findIndex((i) => i.noteNumber === event.noteNumber) !== -1) continue;
        notes.push(event);
      } else {
        notesByTick.set(mcTick, [ event ]);
      }
    }
  }

  // Generate structure NBT
  const dsl = new StructureDSL;

  { // This is for PoC purpose
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

        dsl.block(
          { x: _tick, y: currentY + i + 3, z: currentZ },
          `execute as @a at @s run playsound minecraft:lkrb.piano.p${note.noteNumber}fff master @s ~ ~ ~ 1 1`,
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
