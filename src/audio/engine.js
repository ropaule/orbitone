import * as Tone from 'tone';

let synths = [];
let loops = [];
let masterVolume = null;

// Stored params — update() writes these, play() reads them
let currentShift = 0;
let currentBpm = 120;
let currentVolume = 70;
let currentRelease = "8n";

export function update({ volume, bpm, shift, release } = {}) {
  // Always store, even before play()
  if (volume !== undefined) currentVolume = volume;
  if (bpm !== undefined) currentBpm = bpm;
  if (shift !== undefined) currentShift = shift;
  if (release !== undefined) currentRelease = release;

  // Apply volume to live audio
  if (masterVolume) {
    const db = currentVolume === 0 ? -Infinity : Tone.gainToDb(currentVolume / 100);
    masterVolume.volume.rampTo(db, 0.05);
  }

  // Recalculate loop intervals
  if (loops.length > 0) {
    const base = 60 / Math.max(currentBpm, 10);
    loops.forEach((l, i) => { l.interval = base + i * currentShift; });
  }
}

export async function play(notes = ["B2", "C3", "G3", "B3", "C4", "E4", "G4", "B4", "D5", "E5"]) {
  if (synths.length > 0) {
    // Resume from pause
    Tone.getTransport().start();
    return;
  }

  await Tone.start();

  // Use stored values from update()
  const db = currentVolume === 0 ? -Infinity : Tone.gainToDb(currentVolume / 100);
  masterVolume = new Tone.Volume(db).toDestination();

  const base = 60 / Math.max(currentBpm, 10);
  synths = notes.map(() => new Tone.Synth().connect(masterVolume));
  loops = notes.map((note, i) =>
    new Tone.Loop((time) => {
      synths[i].triggerAttackRelease(note, currentRelease, time);
    }, base + i * currentShift).start(0)
  );

  Tone.getTransport().start();
}

export function pause() {
  Tone.getTransport().pause();
}

export function reset() {
  loops.forEach(l => { l.stop(); l.dispose(); });
  synths.forEach(s => s.dispose());
  masterVolume?.dispose();
  Tone.getTransport().stop();
  loops = [];
  synths = [];
  masterVolume = null;
}
