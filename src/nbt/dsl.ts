import nbt, { TagType } from 'prismarine-nbt';
import pako from 'pako';
import type { Facing, Vector3 } from '../types';
import type { DSLBlock, BlockType } from './types';

type FillExtraFn = (index: number, position: Vector3) => {
  command: string,
  facing: Facing,
  type?: BlockType,
};

const paletteKey = (block: DSLBlock) => (
  `${block.type === 'chain' ? 'ccb' : 'cb'}-${block.facing}`
);

export class StructureDSL {
  private minX = Infinity;
  private maxX = -Infinity;
  private minY = Infinity;
  private maxY = -Infinity;
  private minZ = Infinity;
  private maxZ = -Infinity;

  private blocks: DSLBlock[] = [];

  get width() {
    return (this.maxX - this.minX) + 1;
  }

  get height() {
    return (this.maxY - this.minY) + 1;
  }

  get depth() {
    return (this.maxZ - this.minZ) + 1;
  }

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

  toNBT() {
    if (this.blocks.length <= 0)
      throw new Error('No blocks in this DSL');

    return new Promise<Uint8Array<ArrayBuffer>>((res) => {
      const paletteMap = new Map<string, number>();
      const palette: any[] = []; // TODO: Types

      // Build palette
      for (const b of this.blocks) {
        const key = paletteKey(b);
        if (paletteMap.has(key)) continue;

        paletteMap.set(key, palette.length);
        palette.push({
          Name: nbt.string(`minecraft:${b.type === 'chain' ? 'chain_command_block' : 'command_block'}`),
          Properties: nbt.comp({ facing: nbt.string(b.facing), conditional: nbt.string('false') }),
        });
      }

      const blocksNBT: any[] = []; // TODO: Types

      for (const b of this.blocks) {
        const key = paletteKey(b);
        const stateIndex = paletteMap.get(key);
        if (stateIndex === (void 0))
          throw new Error(`Cannot found palette index for block: ${key}`);
        
        const px = b.pos.x - this.minX;
        const py = b.pos.y - this.minY;
        const pz = b.pos.z - this.minZ;

        blocksNBT.push({
          pos: nbt.list(nbt.int([ px, py, pz ])),
          nbt: nbt.comp({
            id: nbt.string(`minecraft:${b.type === 'chain' ? 'chain_command_block' : 'command_block'}`),
            Command: nbt.string(b.command),
            // @ts-ignore
            auto: nbt.byte((b.type === 'chain') + 0),
            //
            CustomName: nbt.string("{\"text\":\"@\"}"),
            conditionMet: nbt.byte(0),
            powered: nbt.byte(0),
            SuccessCount: nbt.int(0),
            TrackOutput: nbt.byte(0),
            UpdateLastExecution: nbt.byte(0),
          }),
          state: nbt.int(stateIndex),
        });
      }

      const result = nbt.comp({
        size: nbt.list(nbt.int([ this.width, this.height, this.depth ])),
        entities: nbt.list(nbt.comp([])),
        blocks: nbt.list(nbt.comp(blocksNBT)),
        palette: nbt.list(nbt.comp(palette)),
        DataVersion: nbt.int(3465),
      });

      // @ts-ignore
      const buffer = nbt.writeUncompressed(result);
      const gzipped = pako.gzip(buffer);
      res(gzipped);
    });
  }
}
