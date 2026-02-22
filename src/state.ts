import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import type { MidiFile } from 'midifile-ts';
import type { Nullable, Vector3, Facing } from './types';

interface GlobalState {
  midi: Nullable<MidiFile>,
  midiFileName: Nullable<string>,
  maxDepth: number,
  maxWidth: number,
  startPos: Vector3,
  pianoFacing: Facing,
  fallingHeight: number,
  gameTickrate: number,
};

export const useStore = create(
  combine(
    {
      midi: null,
      midiFileName: null,
      maxDepth: 50,
      maxWidth: 140,
      startPos: { x: 0, y: 0, z: 0 },
      pianoFacing: 'south',
      fallingHeight: 60,
      gameTickrate: 20,
    } as GlobalState,
    (set, get) => ({
      setMidi: (midi: MidiFile) => {
        set(() => ({
          midi: midi,
        }));
      },

      setMidiFileName: (filename: string) => {
        set(() => ({
          midiFileName: filename,
        }));
      },

      setMaxDepth: (depth: number) => {
        set(() => ({
          maxDepth: depth
        }));
      },

      setMaxWidth: (width: number) => {
        set(() => ({
          maxWidth: width,
        }));
      },

      setStartPos: (axis: 'x' | 'y' | 'z', value: number) => {
        const pos = get().startPos;
        pos[axis] = value;

        set(() => ({
          startPos: { ...pos },
        }));
      },

      setFacing: (facing: Facing) => {
        set(() => ({
          pianoFacing: facing,
        }));
      },

      setFallingHeight: (height: number) => {
        set(() => ({
          fallingHeight: height,
        }));
      },

      setGameTickrate: (tickrate: number) => {
        set(() => ({
          gameTickrate: tickrate,
        }));
      },
    })
  )
);
