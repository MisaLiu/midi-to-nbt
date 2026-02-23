import { useStore } from './state';
import type { TargetedInputEvent } from 'preact';

export const NbtSettings = () => {
  const maxDepth = useStore(s => s.maxDepth);
  const maxWidth = useStore(s => s.maxWidth);
  const gameTickrate = useStore(s => s.gameTickrate);

  const setMaxDepth = useStore(s => s.setMaxDepth);
  const setMaxWidth = useStore(s => s.setMaxWidth);
  const setGameTickrate = useStore(s => s.setGameTickrate);

  const handleMaxDepthInput = (e: TargetedInputEvent<HTMLInputElement>) => {
    const _value = (e.target as HTMLInputElement)?.value;
    if (!_value) return;

    const value = parseInt(_value);
    if (isNaN(value)) return;

    setMaxDepth(value);
  };

  const handleMaxWidthInput = (e: TargetedInputEvent<HTMLInputElement>) => {
    const _value = (e.target as HTMLInputElement)?.value;
    if (!_value) return;

    const value = parseInt(_value);
    if (isNaN(value)) return;

    setMaxWidth(value);
  };

  const handleGameTickrateInput = (e: TargetedInputEvent<HTMLInputElement>) => {
    const _value = (e.target as HTMLInputElement)?.value;
    if (!_value) return;

    const value = parseInt(_value);
    if (isNaN(value)) return;

    setGameTickrate(value);
  };

  return (
    <fieldset class="settings">
      <legend>Settings</legend>
      <div>
        <label>
          Max Depth:
          <input type="number" value={maxDepth} onInput={handleMaxDepthInput} />
        </label>
      </div>

      <div>
        <label>
          Max Width:
          <input type="number" value={maxWidth} onInput={handleMaxWidthInput} />
        </label>
      </div>

      <div>
        <label>
          Game tickrate:
          <input
            type='number'
            step={1}
            min={1}
            value={gameTickrate}
            onInput={handleGameTickrateInput}
          />
        </label>
      </div>
    </fieldset>
  );
};