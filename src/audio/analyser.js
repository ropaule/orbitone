import * as Tone from 'tone';

// Shared FFT analyser — both engine and instrument connect to this.
// 128-bin FFT, heavily smoothed so the visualiser moves like a cloud.
export const sharedAnalyser = new Tone.Analyser('fft', 128);
sharedAnalyser.smoothing = 0.88;
