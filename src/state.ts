import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import type { MidiFile } from 'midifile-ts';
import type { Nullable, Vector3 } from './types';

interface GlobalState {
  midi: Nullable<MidiFile>,
  startPos: Vector3,
  pianoFacing: 'east' | 'west' | 'north' | 'south',
  fallingHeight: number,
};

export const useStore = create(
  combine(
    {
      midi: null,
      startPos: { x: 0, y: 0, z: 0 },
      pianoFacing: 'south',
      fallingHeight: 20,
    } as GlobalState,
    (set, get) => ({
      setMidi: (midi: MidiFile) => {
        set(() => ({
          midi: midi,
        }));
      },

      setStartPos: (axis: 'x' | 'y' | 'z', value: number) => {
        const pos = get().startPos;
        pos[axis] = value;

        set(() => ({
          startPos: { ...pos },
        }));
      },

      setFacing: (facing: 'east' | 'west' | 'north' | 'south') => {
        set(() => ({
          pianoFacing: facing,
        }));
      },

      setFallingHeight: (height: number) => {
        set(() => ({
          fallingHeight: height,
        }));
      },
    })
  )
);
