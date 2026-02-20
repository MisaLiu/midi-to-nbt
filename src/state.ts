import { create } from 'zustand';
import type { MidiFile } from 'midifile-ts';
import type { Nullable, Vector3 } from './types';

interface GlobalState {
  midi: Nullable<MidiFile>,
  startPos: Vector3,
  pianoFacing: Nullable<'east' | 'west' | 'north' | 'south'>,
};

interface GlobalStateWithActions extends GlobalState {
  setMidi: (midi: MidiFile) => void,
}

export const useStore = create<GlobalStateWithActions>((set) => ({
  midi: null,
  startPos: { x: 0, y: 0, z: 0 },
  pianoFacing: null,

  setMidi: (midi) => set(() => ({
    midi,
  })),
}));
