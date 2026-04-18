export default {
  name: "Default",
  notes: ["B2", "C3", "G3", "B3", "C4", "E4", "G4", "B4", "D5", "E5"],
  bpm: 120,
  volume: 70,
  shiftStep: 1 / 256,
  synth: {
    type: "fm",
    release: "2n",
    options: {
      harmonicity: 5.1,
      modulationIndex: 32,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1 },
      modulation: { type: "sine" },
      modulationEnvelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.5 },
    },
  },
  instrument_1: {
    name: "Bass",
    volume: -3,
    synth: {
      type: "mono",
      options: {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.9, release: 0.4 },
        filter: { Q: 3, type: "lowpass", rolloff: -24 },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.15,
          sustain: 0.5,
          release: 0.3,
          baseFrequency: 250,
          octaves: 2.5,
        },
      },
    },
  },
  fx: {
    delay: { wet: 0.2, delayTime: "8n", feedback: 0.35 },
    reverb: { wet: 0.25, decay: 3, preDelay: 0.01 },
  },
};
