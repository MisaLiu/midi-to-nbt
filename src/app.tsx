import { MidiFile } from './MidiFile';
import { NbtSettings } from './NbtSettings';
import { ResultSection } from './ResultSection';
import './app.css';

export function App() {
  return (
    <>
      <fieldset>
        <legend>Read before use</legend>
        <div>This tools is designed with Minecraft 1.20.1</div>
        <div>Structures are facing East, please don't rotate the structure!</div>
      </fieldset>

      <MidiFile />
      <NbtSettings />
      <ResultSection />
    </>
  )
}
