import { read } from 'midifile-ts';
import type { MidiFile } from 'midifile-ts';

export const readMidiFile = (file: Blob) => new Promise<MidiFile>((res, rej) => {
  const reader = new FileReader();

  reader.onload = () => {
    res(read(reader.result as ArrayBuffer));
  };

  reader.onerror = rej;

  reader.readAsArrayBuffer(file);
});
