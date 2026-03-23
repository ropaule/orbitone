import { useState } from 'react';
import './App.css'; 
import { Knob } from './components/Knob'

function App() {
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(70);

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
          </div>
        </div>
        <div className="circle-placeholder">
          Rings...
        </div>
      </main>

      {/* SIDEBAR*/}
      <aside className="sidebar">
      </aside>

    </div>
  )
}

export default App