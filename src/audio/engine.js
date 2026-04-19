import * as Tone from 'tone';
import { sharedAnalyser } from './analyser';

let synths = [];
let loops = [];
let masterVolume = null;
let delay = null;
let reverb = null;
let currentShift = 0;
let currentBpm = 120;
let currentVolume = 70;
let currentRelease = "8n";
let currentDelay = { wet: 0.2, delayTime: "8n", feedback: 0.35 };
let currentReverb = { wet: 0.25, decay: 3, preDelay: 0.01 };
let currentSynth = { type: "synth", release: "8n", options: {} };
let onNoteCallback = null;

function createSynth() {
  switch (currentSynth.type) {
    case "fm": return new Tone.FMSynth(currentSynth.options);
    case "am": return new Tone.AMSynth(currentSynth.options);
    default:   return new Tone.Synth(currentSynth.options);
  }
}

export function setOnNote(cb) { onNoteCallback = cb; }

const volumeToDb = (v) => v === 0 ? -Infinity : Tone.gainToDb(v / 100);
const baseInterval = () => 60 / Math.max(currentBpm, 10);

export function update({ volume, bpm, shift, release, synth } = {}) {
  if (volume !== undefined) currentVolume = volume;
  if (bpm !== undefined) currentBpm = bpm;
  if (shift !== undefined) currentShift = shift;
  if (release !== undefined) currentRelease = release;
  if (synth !== undefined) { currentSynth = synth; currentRelease = synth.release ?? currentRelease; }

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
  masterVolume.connect(sharedAnalyser);

  reverb = new Tone.Reverb({ decay: currentReverb.decay, preDelay: currentReverb.preDelay });
  reverb.wet.value = currentReverb.wet;
  reverb.connect(masterVolume);
  await reverb.ready;

  delay = new Tone.FeedbackDelay({ delayTime: currentDelay.delayTime, feedback: currentDelay.feedback });
  delay.wet.value = currentDelay.wet;
  delay.connect(reverb);

  const base = baseInterval();
  synths = notes.map(() => createSynth().connect(delay));
  loops = notes.map((note, i) =>
    new Tone.Loop((time) => {
      synths[i].triggerAttackRelease(note, currentRelease, time);
      onNoteCallback?.({ voiceIndex: i, note, firedAt: performance.now() });
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
  delay?.dispose();
  reverb?.dispose();
  masterVolume?.dispose();
  Tone.getTransport().stop();
  loops = [];
  synths = [];
  delay = null;
  reverb = null;
  masterVolume = null;
}
