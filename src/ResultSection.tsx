import { useStore } from './state';
import { generateNbt } from './nbt';
import { downloadFile } from './utils';

export const ResultSection = () => {
  const midiFile = useStore(s => s.midi);
  const midiFileName = useStore(s => s.midiFileName);
  const maxDepth = useStore(s => s.maxDepth);
  const maxWidth = useStore(s => s.maxWidth);
  const gameTickrate = useStore(s => s.gameTickrate);

  const handleGenerateStart = () => {
    if (!midiFile) return;

    generateNbt(
      midiFile,
      maxDepth,
      maxWidth,
      gameTickrate
    ).then((buffer) => {
      downloadFile(new Blob([ buffer ]), `${midiFileName ?? 'result'}.nbt`);
    }).catch(console.error);
  };

  return (
    <fieldset>
      <legend>Result</legend>
      <button onClick={handleGenerateStart}>Generate!</button>
    </fieldset>
  );
};
