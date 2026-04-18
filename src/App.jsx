import { useState } from 'react';
import { play, pause, reset } from './audio/engine';
import './App.css';
import { Knob } from './components/Knob'
import { TransportControls } from './components/TransportControls'

function App() {
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(70);
  const [status, setStatus] = useState('stopped'); // 'stopped' | 'playing' | 'paused'

  const handlePlayPause = async () => {
    if (status === 'playing') {
      pause();
      setStatus('paused');
    } else {
      await play();
      setStatus('playing');
    }
  };

  const handleReset = () => {
    reset();
    setStatus('stopped');
  };

  return (
    <div className="app-container">
      {/* MAIN */}
      <main className="stage">
        <header className="logo-text">
          <h1 className="logo-text">
            orbitone<span className="logo-light"> studio</span>
          </h1>
        </header>
        <div className='main-controls'>
          <div className='main-knobs'>
            <Knob label="Tempo" size='xs' value={bpm} max={1000} onChange={setBpm} />
            <Knob label="Vol" size='m' value={volume} onChange={setVolume} />
            <TransportControls status={status} onPlayPause={handlePlayPause} onReset={handleReset} />
          </div>
        </div>
        <div className="circle-placeholder">
          Rings...
        </div>
        <div className='visualizer'>
          
        </div>
      </main>

      {/* SIDEBAR*/}
      <aside className="sidebar">
      </aside>

    </div>
  )
}

export default App