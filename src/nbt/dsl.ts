import type { Facing, Vector3 } from '../types';
import type { DSLBlock, BlockType } from './types';

type FillExtraFn = (index: number, position: Vector3) => {
  command: string,
  facing: Facing,
  type?: BlockType,
};

export class StructureDSL {
  private minX = Infinity;
  private maxX = -Infinity;
  private minY = Infinity;
  private maxY = -Infinity;
  private minZ = Infinity;
  private maxZ = -Infinity;

  private blocks: DSLBlock[] = [];

  private updateBounds(position: Vector3) {
    this.minX = Math.min(this.minX, position.x);
    this.maxX = Math.max(this.maxX, position.x);
    this.minY = Math.min(this.minY, position.y);
    this.maxY = Math.max(this.maxY, position.y);
    this.minZ = Math.min(this.minZ, position.z);
    this.maxZ = Math.max(this.maxZ, position.z);
  }

  block(
    position: Vector3,
    command: string,
    facing: Facing,
    type?: BlockType
  ) {
    this.blocks.push({
      pos: position,
      command,
      facing,
      type: type ?? null
    });
    this.updateBounds(position);
  }

  fill(start: Vector3, stop: Vector3, command: string, facing: Facing, type?: BlockType): void;
  fill(start: Vector3, stop: Vector3, extra: FillExtraFn): void;
  fill(
    start: Vector3,
    stop: Vector3,
    commandOrExtra: string | FillExtraFn,
    facing?: Facing,
    type?: BlockType
  ) {
    const minX = Math.min(start.x, stop.x);
    const maxX = Math.max(start.x, stop.x);
    const minY = Math.min(start.y, stop.y);
    const maxY = Math.max(start.y, stop.y);
    const minZ = Math.min(start.z, stop.z);
    const maxZ = Math.max(start.z, stop.z);

    if (typeof commandOrExtra === 'string') {
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          for (let z = minZ; z <= maxZ; z++) {
            this.block(
              { x, y, z },
              commandOrExtra,
              facing!,
              type
            );
          }
        }
      }
    } else {
      let index = 0;
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          for (let z = minZ; z <= maxZ; z++) {
            const { command, facing, type } = commandOrExtra(index, { x, y, z });
            this.block(
              { x, y, z },
              command,
              facing,
              type,
            );
            index++;
          }
        }
      }
    }
  }
}
