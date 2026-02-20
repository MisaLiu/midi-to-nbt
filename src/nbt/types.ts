import type { Vector3, Nullable, Facing } from '../types';

export type BlockType = 'normal' | 'chain';

export interface DSLBlock {
  pos: Vector3,
  type: Nullable<BlockType>,
  command: string,
  facing: Facing,
}
