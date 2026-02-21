import type { Vector3, Nullable, Facing } from '../types';

export type BlockType = 'normal' | 'chain';

export interface DSLBlock {
  pos: Vector3,
  type: Nullable<BlockType>,
  command: string,
  facing: Facing,
}

export interface BPM {
  tick: number,
  microsecondsPerBeat: number,
  bpm: number,
}

export interface NoteSimple {
  time: number,
  pitch: number,
  velocity: number,
}
