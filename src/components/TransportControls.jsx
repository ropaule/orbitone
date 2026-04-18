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

export function TransportControls({ status, onPlayPause, onReset }) {
  return (
    <div className="transport-pill">
      <button className="transport-btn" onClick={onReset} aria-label="Reset">
        <IconSquare />
      </button>
      <div className="transport-divider" />
      <button className="transport-btn" onClick={onPlayPause} aria-label={status === 'playing' ? 'Pause' : 'Play'}>
        {status === 'playing' ? <IconPause /> : <IconPlay />}
      </button>
    </div>
  );
}
