import { useStore } from './state';
import type { TargetedEvent, TargetedInputEvent } from 'preact';
import type { Facing } from './types';

export const NbtSettings = () => {
  const startPos = useStore(s => s.startPos);
  const pianoFacing = useStore(s => s.pianoFacing);
  const fallingHeight = useStore(s => s.fallingHeight);

  const setStartPos = useStore(s => s.setStartPos);
  const setPianoFacing = useStore(s => s.setFacing);
  const setFallingHeight = useStore(s => s.setFallingHeight);

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

  return (
    <fieldset>
      <legend>NBT settings</legend>
      <div>
        Start position:
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
          Facing:
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
          Falling height:
          <input
            type='number'
            step={1}
            value={fallingHeight}
            onInput={handleFallingHeightInput}
          />
        </label>
      </div>
    </fieldset>
  );
};