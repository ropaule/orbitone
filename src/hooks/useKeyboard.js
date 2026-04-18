import { useEffect, useRef } from 'react';
import { initInstrument, triggerNote, releaseNote, disposeInstrument } from '../audio/instrument';

// Physical key codes (e.code) — layout-independent (QWERTY, QWERTZ, AZERTY, …).
//
// Two-row setup, each row is a pair of white + black keys:
//
//   Number row:  1   [2] [3]  4  [5] [6] [7]  8  [9] [0]  …
//   QWERTY row:  Q   W   E   R   T   Y   U   I   O   P
//   Note:        C3  D3  E3  F3  G3  A3  B3  C4  D4  E4
//
//   ASDF row:    A  [S] [D]  F  [G] [H] [J]  K  [L] [;]  …
//   ZXCV row:    Z   X   C   V   B   N   M   ,   .   /
//   Note:        C2  D2  E2  F2  G2  A2  B2  C3  D3  E3
//
export const KEY_NOTE_MAP = {
  // ZXCV row — white keys C2–B2
  'KeyZ': 'C2',
  'KeyX': 'D2',
  'KeyC': 'E2',
  'KeyV': 'F2',
  'KeyB': 'G2',
  'KeyN': 'A2',
  'KeyM': 'B2',
  // ASDF row — black keys C#2–A#2
  'KeyS': 'C#2',
  'KeyD': 'D#2',
  'KeyG': 'F#2',
  'KeyH': 'G#2',
  'KeyJ': 'A#2',

  // QWERTY row — white keys C3–E4
  'KeyQ': 'C3',
  'KeyW': 'D3',
  'KeyE': 'E3',
  'KeyR': 'F3',
  'KeyT': 'G3',
  'KeyY': 'A3',
  'KeyU': 'B3',
  'KeyI': 'C4',
  'KeyO': 'D4',
  'KeyP': 'E4',
  // Number row — black keys C#3–D#4
  'Digit2': 'C#3',
  'Digit3': 'D#3',
  'Digit5': 'F#3',
  'Digit6': 'G#3',
  'Digit7': 'A#3',
  'Digit9': 'C#4',
  'Digit0': 'D#4',
};

// Last-note priority: releasing a key while others are held retriggers the most recent.
export function useKeyboard(preset) {
  const heldKeys = useRef([]);

  useEffect(() => {
    async function onKeyDown(e) {
      if (e.repeat) return;
      const key = e.code;
      const note = KEY_NOTE_MAP[key];
      if (!note || heldKeys.current.includes(key)) return;

      await initInstrument(preset);
      heldKeys.current.push(key);
      triggerNote(note);
    }

    function onKeyUp(e) {
      const key = e.code;
      const idx = heldKeys.current.indexOf(key);
      if (idx === -1) return;

      heldKeys.current.splice(idx, 1);

      if (heldKeys.current.length > 0) {
        const lastKey = heldKeys.current[heldKeys.current.length - 1];
        triggerNote(KEY_NOTE_MAP[lastKey]);
      } else {
        releaseNote();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      disposeInstrument();
    };
  }, [preset]);
}
