import { useStore } from './state';
import { generateNbt } from './nbt';
import { downloadFile } from './utils';

export const ResultSection = () => {
  const midiFile = useStore(s => s.midi);

  const handleGenerateStart = () => {
    if (!midiFile) return;

    generateNbt(midiFile)
      .then((buffer) => {
        downloadFile(new Blob([ buffer ]), 'result.nbt');
      })
      .catch(console.error);
  };

  return (
    <fieldset>
      <legend>Result</legend>
      <button onClick={handleGenerateStart}>Generate!</button>
    </fieldset>
  );
};
