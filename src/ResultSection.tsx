import { useStore } from './state';
import { generateNbt } from './nbt';
import { downloadFile } from './utils';

export const ResultSection = () => {
  const midiFile = useStore(s => s.midi);
  const midiFileName = useStore(s => s.midiFileName);
  const maxDepth = useStore(s => s.maxDepth);
  const maxWidth = useStore(s => s.maxWidth);
  const pianoStartPos = useStore(s => s.startPos);
  const pianoFacing = useStore(s => s.pianoFacing);
  const noteFallingHeight = useStore(s => s.fallingHeight);
  const gameTickrate = useStore(s => s.gameTickrate);

  const handleGenerateStart = () => {
    if (!midiFile) return;

    generateNbt(
      midiFile,
      maxDepth,
      maxWidth,
      pianoStartPos,
      pianoFacing,
      noteFallingHeight,
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
