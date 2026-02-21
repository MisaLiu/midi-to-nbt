import { StructureDSL } from './dsl';
import { preciseDouble } from '../utils';
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

  return Math.round(result);
};

export const generateNbt = (midi: MidiFile) => new Promise<Uint8Array<ArrayBuffer>>((res, rej) => {
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
        bpm: preciseDouble(60_000_000 / mpb, 3), // I don't think we need *that* precise
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

      if (notesByTick.has(currentTick)) {
        const notes = notesByTick.get(currentTick)!;
        if (notes.findIndex((i) => i.noteNumber === event.noteNumber) !== -1) continue;
        notes.push(event);
      } else {
        notesByTick.set(currentTick, [ event ]);
      }
    }
  }

  const notesByMs = new Map<number, NoteOnEvent[]>();

  for (const tick of notesByTick.keys()) {
    const notes = notesByTick.get(tick);
    if (!notes || notes.length <= 0) continue;

    const ms = tickToMs(tick, bpm, ppq);
    notesByMs.set(ms, notes);
  }

  // Generate structure NBT
  const dsl = new StructureDSL;

  { // This is for PoC purpose
    let timeCount = 0;
    for (const ms of notesByMs.keys()) {
      if (timeCount >= 50) break;

      const notes = notesByMs.get(ms);
      if (!notes || notes.length <= 0) continue;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const facing = i + 1 < notes.length ? 'up' : 'down';

        dsl.block(
          { x: timeCount, y: i, z: 0 },
          `execute as @a at @s run playsound minecraft:lkrb.piano.p${note.noteNumber}fff master @s ~ ~ ~ 1 1`,
          facing,
          i > 0 ? 'chain' : 'normal',
        );
      }

      timeCount++;
    }
  }

  dsl.toNBT()
    .then(res)
    .catch(rej);
});
