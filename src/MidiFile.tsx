import { readMidiFile } from './utils';
import { useStore } from './state';
import type { TargetedInputEvent } from 'preact';
import type { Nullable } from './types';

export const MidiFile = () => {
  const setMidi = useStore((s) => s.setMidi);
  const setMidiFileName = useStore((s) => s.setMidiFileName);

  const handleFileSelect = (e: TargetedInputEvent<HTMLInputElement>) => {
    const target = (e.target as Nullable<HTMLInputElement>);
    if (!target) return;

    const file = target.files?.[0];
    if (!file) return;

    const filenameSplit = (file.name ?? '').split('.');
    const filename = filenameSplit.splice(0, filenameSplit.length - 1).join('');

    readMidiFile(file)
      .then((midi) => {
        setMidi(midi);
        setMidiFileName(filename ?? null);
      })
      .catch(e => {
        alert(e);
      })
  };

  return (
    <fieldset>
      <legend>Select midi file</legend>
      <input
        type="file"
        accept='.mid,.midi'
        onInput={handleFileSelect}
      />
    </fieldset>
  );
};