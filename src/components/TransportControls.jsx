import { useState } from 'react';
import { play, pause, reset } from '../audio/engine';
import './TransportControls.css';

const IconSquare = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="3" y="3" width="10" height="10" rx="1" />
  </svg>
);

const IconPlay = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <polygon points="4,2 14,8 4,14" />
  </svg>
);

const IconPause = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="3" y="2" width="3.5" height="12" rx="1" />
    <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
  </svg>
);

export function TransportControls({ notes }) {
  const [status, setStatus] = useState('stopped'); // 'stopped' | 'playing' | 'paused'

  const handlePlayPause = async () => {
    if (status === 'playing') {
      pause();
      setStatus('paused');
    } else {
      await play(notes);
      setStatus('playing');
    }
  };

  const handleReset = () => {
    reset();
    setStatus('stopped');
  };

  return (
    <div className="transport-pill">
      <button className="transport-btn" onClick={handleReset} aria-label="Reset">
        <IconSquare />
      </button>
      <div className="transport-divider" />
      <button className="transport-btn" onClick={handlePlayPause} aria-label={status === 'playing' ? 'Pause' : 'Play'}>
        {status === 'playing' ? <IconPause /> : <IconPlay />}
      </button>
    </div>
  );
}
