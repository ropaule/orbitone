import * as Tone from 'tone';

let synths = [];
let loops = [];
let masterVolume = null;
let currentShift = 0;
let currentBpm = 120;
let currentVolume = 70;
let currentRelease = "8n";

const volumeToDb = (v) => v === 0 ? -Infinity : Tone.gainToDb(v / 100);
const baseInterval = () => 60 / Math.max(currentBpm, 10);

export function update({ volume, bpm, shift, release } = {}) {
  if (volume !== undefined) currentVolume = volume;
  if (bpm !== undefined) currentBpm = bpm;
  if (shift !== undefined) currentShift = shift;
  if (release !== undefined) currentRelease = release;

  if (masterVolume) {
    masterVolume.volume.rampTo(volumeToDb(currentVolume), 0.05);
  }

  if (loops.length > 0) {
    const base = baseInterval();
    loops.forEach((l, i) => { l.interval = base + i * currentShift; });
  }
}

export async function play(notes) {
  if (synths.length > 0) {
    Tone.getTransport().start();
    return;
  }

  await Tone.start();

  masterVolume = new Tone.Volume(volumeToDb(currentVolume)).toDestination();

  const base = baseInterval();
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
