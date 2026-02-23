import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import type { MidiFile } from 'midifile-ts';
import type { Nullable } from './types';

interface GlobalState {
  midi: Nullable<MidiFile>,
  midiFileName: Nullable<string>,
  maxDepth: number,
  maxWidth: number,
  gameTickrate: number,
};

export const useStore = create(
  combine(
    {
      midi: null,
      midiFileName: null,
      maxDepth: 50,
      maxWidth: 140,
      gameTickrate: 20,
    } as GlobalState,
    (set) => ({
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

      setGameTickrate: (tickrate: number) => {
        set(() => ({
          gameTickrate: tickrate,
        }));
      },
    })
  )
);
