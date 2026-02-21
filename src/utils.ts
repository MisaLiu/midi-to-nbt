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

export const preciseDouble = (float: number, length = 6) => (
  Math.round(float * Math.pow(10, length)) / Math.pow(10, length)
);

export function downloadFile(file: Blob, filename?: string): void;
export function downloadFile(file: File, filename?: string): void;
export function downloadFile(file: Blob | File, filename?: string) {
  const url = URL.createObjectURL(file);
  const _filename = (file as File)?.name ?? filename ?? 'download.bin';
  
  const dom = document.createElement('a');
  dom.href = url;
  dom.download = _filename;
  dom.click();
}
