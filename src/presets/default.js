export default {
  name: "Default",
  notes: ["B2", "C3", "G3", "B3", "C4", "E4", "G4", "B4", "D5", "E5"],
  bpm: 120,
  volume: 70,
  shiftStep: 1 / 8,
  fx: {
    delay: { wet: 0.2, delayTime: "8n", feedback: 0.35 },
    reverb: { wet: 0.25, decay: 3, preDelay: 0.01 },
  },
};
