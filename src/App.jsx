import { useState, useEffect } from 'react';
import { update } from './audio/engine';
import './App.css';
import { Knob } from './components/Knob'
import { SteppedKnob } from './components/SteppedKnob'
import { TransportControls } from './components/TransportControls'
import defaultPreset from './presets/default'

// 16 steps: 0 (no shift) on the left, 1/2 on the right
const SHIFT_STEPS = [
  { label: '0', value: 0 },
  ...Array.from({ length: 15 }, (_, i) => {
    const denominator = Math.pow(2, 15 - i); // 32768 down to 2
    return { label: `1/${denominator}`, value: 1 / denominator };
  }),
];

function App() {
  const [bpm, setBpm] = useState(defaultPreset.bpm);
  const [volume, setVolume] = useState(defaultPreset.volume);
  const [shiftStep, setShiftStep] = useState(defaultPreset.shiftStep);

  useEffect(() => {
    update({ volume, bpm, shift: shiftStep * (60 / bpm) });
  }, [volume, bpm, shiftStep]);

  return (
    <div className="app-container">
      <main className="stage">
        <header className="logo-text">
          <h1 className="logo-text">
            orbitone<span className="logo-light"> studio</span>
          </h1>
        </header>
        <div className='main-controls'>
          <div className='main-knobs'>
            <Knob label="Tempo" size='m' value={bpm} max={1000} onChange={setBpm} />
            <Knob label="Vol" size='m' value={volume} onChange={setVolume} />
            <SteppedKnob label="Shift" size='m' steps={SHIFT_STEPS} value={shiftStep} onChange={setShiftStep} />
            <TransportControls notes={defaultPreset.notes} />
          </div>
        </div>
        <div className="circle-placeholder">
          Rings...
        </div>
        <div className='visualizer'>
        </div>
      </main>

      <aside className="sidebar">
      </aside>
    </div>
  )
}

export default App
