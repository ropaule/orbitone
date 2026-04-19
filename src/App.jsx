import { useState, useEffect, useRef } from 'react';
import { update, setOnNote, play, pause, reset } from './audio/engine';
import { useKeyboard } from './hooks/useKeyboard';
import './App.css';
import { Knob } from './components/Knob'
import { SteppedKnob } from './components/SteppedKnob'
import { TransportControls } from './components/TransportControls'
import { Visualiser } from './components/Visualiser'
import { EQVisualiser } from './components/EQVisualiser'
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
  useKeyboard(defaultPreset.instrument_1);

  const [bpm, setBpm] = useState(defaultPreset.bpm);
  const [volume, setVolume] = useState(defaultPreset.volume);
  const [shiftStep, setShiftStep] = useState(defaultPreset.shiftStep);
  const [status, setStatus] = useState('stopped');
  const noteEventsRef = useRef([]);

  const handlePlayPause = async () => {
    if (status === 'playing') {
      pause();
      setStatus('paused');
    } else {
      await play(defaultPreset.notes);
      setStatus('playing');
    }
  };

  const handleReset = () => {
    reset();
    noteEventsRef.current = [];
    setStatus('stopped');
  };

  useEffect(() => {
    setOnNote((event) => { noteEventsRef.current.push(event); });
    update({ synth: defaultPreset.main_instrument });
  }, []);

  useEffect(() => {
    update({ volume, bpm, shift: shiftStep * (60 / bpm) });
  }, [volume, bpm, shiftStep]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.code !== 'Space') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      handlePlayPause();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status]); // re-bind when status changes so the closure sees the latest value

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
            <TransportControls status={status} onPlayPause={handlePlayPause} onReset={handleReset} />
          </div>
        </div>
        <div className="circle-placeholder">
          <Visualiser noteEventsRef={noteEventsRef} notes={defaultPreset.notes} bpm={bpm} shiftStep={shiftStep} status={status} />
        </div>
        <div className='visualiser'>
          <EQVisualiser />
        </div>
      </main>

      <aside className="sidebar">
      </aside>
    </div>
  )
}

export default App
