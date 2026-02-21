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

export const generateNbt = (midi: MidiFile) => new Promise<Uint8Array<ArrayBuffer>>((res, rej) => {
  // TODO: These should be arguments
  const maxDepth = 40;
  const startPosX = 70;

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
    let currentZ = 0;

    for (const tick of notesTick) {
      if (tick >= 1200) break;

      const notes = notesByTick.get(tick);
      if (!notes || notes.length <= 0) continue;

      let _tick = tick - (maxDepth * currentZ);
      if (_tick >= maxDepth) {
        dsl.fill(
          { x: 0, y: 1, z: currentZ },
          { x: maxDepth - 1, y: 1, z: currentZ },
          'setblock ~ ~1 ~ minecraft:air',
          'down'
        );

        dsl.fill(
          { x: 0, y: 0, z: currentZ },
          { x: maxDepth - 1, y: 0, z: currentZ },
          (index) => {
            let command = 'setblock ~1 ~2 ~ minecraft:redstone_block';
            if (index + 1 >= maxDepth) command = `setblock ~-${maxDepth - 1} ~2 ~1 minecraft:redstone_block`;

            return {
              command,
              facing: 'down',
              type: 'chain',
            };
          }
        );

        _tick -= maxDepth;
        currentZ++;
      }

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];

        dsl.block(
          { x: _tick, y: i + 3, z: currentZ },
          `execute as @a at @s run playsound minecraft:lkrb.piano.p${note.noteNumber}fff master @s ~ ~ ~ 1 1`,
          'up',
          i > 0 ? 'chain' : 'normal',
        );
      }
    }

    dsl.fill(
      { x: 0, y: 1, z: currentZ },
      { x: maxDepth - 1, y: 1, z: currentZ },
      'setblock ~ ~1 ~ minecraft:air',
      'down'
    );

    dsl.fill(
      { x: 0, y: 0, z: currentZ },
      { x: maxDepth - 1, y: 0, z: currentZ },
      (index) => {
        let command = 'setblock ~1 ~2 ~ minecraft:redstone_block';
        if (index + 1 >= maxDepth) command = `setblock ${startPosX} ~2 ~1 minecraft:redstone_block`;

        return {
          command,
          facing: 'up',
          type: 'chain',
        };
      }
    );
  }

  dsl.toNBT()
    .then(res)
    .catch(rej);
});
