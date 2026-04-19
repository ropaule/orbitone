import * as Tone from 'tone';

let synth = null;
let vol = null;
let initPromise = null;

function createSynth(preset) {
  switch (preset?.type) {
    case 'mono': return new Tone.MonoSynth(preset.options ?? {});
    case 'fm':   return new Tone.FMSynth(preset.options ?? {});
    case 'am':   return new Tone.AMSynth(preset.options ?? {});
    default:     return new Tone.Synth(preset?.options ?? {});
  }
}

export function initInstrument(preset = {}) {
  if (!initPromise) {
    initPromise = Tone.start().then(() => {
      // Lower lookahead for live-playable instruments (default 0.1s is for scheduled audio)
      Tone.getContext().lookAhead = 0.01;
      vol = new Tone.Volume(preset.volume ?? 0).toDestination();
      synth = createSynth(preset.synth).connect(vol);
    });
  }
  return initPromise;
}

export function triggerNote(note) {
  synth?.triggerAttack(note);
}

export function releaseNote() {
  synth?.triggerRelease();
}

export function disposeInstrument() {
  synth?.dispose();
  vol?.dispose();
  synth = null;
  vol = null;
  initPromise = null;
}
