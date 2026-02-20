import { readMidiFile } from './utils';
import { useStore } from './state';
import type { TargetedInputEvent } from 'preact';
import type { Nullable } from './types';

export const MidiFile = () => {
  const setMidi = useStore((s) => s.setMidi);

  const handleFileSelect = (e: TargetedInputEvent<HTMLInputElement>) => {
    const target = (e.target as Nullable<HTMLInputElement>);
    if (!target) return;

    const file = target.files?.[0];
    if (!file) return;

    readMidiFile(file)
      .then((midi) => {
        setMidi(midi);
        console.log(midi);
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