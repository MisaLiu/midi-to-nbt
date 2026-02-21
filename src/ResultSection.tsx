import { useStore } from './state';
import { generateNbt } from './nbt';
import { downloadFile } from './utils';

export const ResultSection = () => {
  const midiFile = useStore(s => s.midi);
  const maxDepth = useStore(s => s.maxDepth);
  const maxWidth = useStore(s => s.maxWidth);

  const handleGenerateStart = () => {
    if (!midiFile) return;

    generateNbt(midiFile, maxDepth, maxWidth)
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
