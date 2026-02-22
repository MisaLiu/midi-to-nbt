import { useStore } from './state';
import type { TargetedEvent, TargetedInputEvent } from 'preact';
import type { Facing } from './types';

export const NbtSettings = () => {
  const maxDepth = useStore(s => s.maxDepth);
  const maxWidth = useStore(s => s.maxWidth);
  const startPos = useStore(s => s.startPos);
  const pianoFacing = useStore(s => s.pianoFacing);
  const fallingHeight = useStore(s => s.fallingHeight);
  const gameTickrate = useStore(s => s.gameTickrate);

  const setMaxDepth = useStore(s => s.setMaxDepth);
  const setMaxWidth = useStore(s => s.setMaxWidth);
  const setStartPos = useStore(s => s.setStartPos);
  const setPianoFacing = useStore(s => s.setFacing);
  const setFallingHeight = useStore(s => s.setFallingHeight);
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

  const handleStartPosInput = (axis: 'x' | 'y' | 'z', e: TargetedInputEvent<HTMLInputElement>) => {
    const _value = (e.target as HTMLInputElement)?.value;
    if (!_value) return;

    const value = parseInt(_value);
    if (isNaN(value)) return;

    setStartPos(axis, value);
  };

  const handleFacingChanged = (e: TargetedEvent<HTMLSelectElement, Event>) => {
    const value = (e.target as HTMLSelectElement)?.value;
    if (!value) return;

    setPianoFacing(value as Facing);
  };

  const handleFallingHeightInput = (e: TargetedInputEvent<HTMLInputElement>) => {
    const _value = (e.target as HTMLInputElement)?.value;
    if (!_value) return;

    const value = parseInt(_value);
    if (isNaN(value)) return;

    setFallingHeight(value);
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
        Piano start position:
        <ul>
          <li>
            <label>
              X:
              <input
                type="number"
                step={1}
                value={startPos.x}
                onInput={(e) => handleStartPosInput('x', e)}
              />
            </label>
          </li>
          <li>
            <label>
              Y:
              <input
                type="number"
                step={1}
                value={startPos.y}
                onInput={(e) => handleStartPosInput('y', e)}
              />
            </label>
          </li>
          <li>
            <label>
              Z:
              <input
                type="number"
                step={1}
                value={startPos.z}
                onInput={(e) => handleStartPosInput('z', e)}
              />
            </label>
          </li>
        </ul>
      </div>

      <div>
        <label>
          Piano facing:
          <select value={pianoFacing} onChange={handleFacingChanged}>
            <option value='north'>North</option>
            <option value='south'>South</option>
            <option value='east'>East</option>
            <option value='west'>West</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Note falling height:
          <input
            type='number'
            step={1}
            value={fallingHeight}
            onInput={handleFallingHeightInput}
          />
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