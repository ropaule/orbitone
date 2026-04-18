import * as Tone from 'tone';

let synths = [];
let loops = [];

export async function play(notes = ["C4", "E4", "G4"], shift = 0.02) {
  if (synths.length > 0) {
    Tone.getTransport().start();
    return;
  }

  await Tone.start();

  synths = notes.map(() => new Tone.Synth().toDestination());
  loops = notes.map((note, i) =>
    new Tone.Loop((time) => {
      synths[i].triggerAttackRelease(note, "8n", time);
    }, 1.0 + i * shift).start(0)
  );

  Tone.getTransport().start();
}

export function pause() {
  Tone.getTransport().pause();
}

export function reset() {
  loops.forEach(l => { l.stop(); l.dispose(); });
  synths.forEach(s => s.dispose());
  Tone.getTransport().stop();
  loops = [];
  synths = [];
}
