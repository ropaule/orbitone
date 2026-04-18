import { useRef, useEffect } from 'react';

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MIN_R = 46;
const MAX_R = 168;
const PULSE_MS = 350;
const TRAIL_ARC = (2 * Math.PI) / 3; // 120° comet tail

// --- Geometry ---

function orbitRadius(i, total) {
  return MIN_R + (i / Math.max(total - 1, 1)) * (MAX_R - MIN_R);
}

function intervalMs(i, bpm, shiftStep) {
  return (60000 / Math.max(bpm, 10)) * (1 + i * shiftStep);
}

function voiceAngle(elapsed, ms) {
  return -Math.PI / 2 + ((elapsed % ms) / ms) * 2 * Math.PI;
}

// --- Drawing ---

function drawTrack(ctx, r, hue) {
  ctx.beginPath();
  ctx.arc(CX, CY, r, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${hue}, 30%, 40%, 0.18)`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawTrail(ctx, r, hue, angle) {
  const grad = ctx.createConicGradient(angle - TRAIL_ARC, CX, CY);
  grad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0)`);
  grad.addColorStop(1 / 3, `hsla(${hue}, 80%, 70%, 0.6)`);
  ctx.beginPath();
  ctx.arc(CX, CY, r, angle - TRAIL_ARC, angle);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawDot(ctx, x, y, hue, pulseFactor) {
  if (pulseFactor > 0) {
    const glowR = 14 + pulseFactor * 10;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    grd.addColorStop(0, `hsla(${hue}, 100%, 75%, ${0.45 + pulseFactor * 0.4})`);
    grd.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`);
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.shadowBlur = 8 + pulseFactor * 12;
    ctx.shadowColor = `hsl(${hue}, 100%, 75%)`;
  }

  ctx.beginPath();
  ctx.arc(x, y, 4 + pulseFactor * 2, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${hue}, 90%, 80%)`;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// --- Component ---

export function Visualiser({ noteEventsRef, notes, bpm, shiftStep, status }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const bpmRef = useRef(bpm);
  const shiftRef = useRef(shiftStep);
  const statusRef = useRef(status);
  const startedAtRef = useRef(null);
  const pausedAtRef = useRef(null);
  const lastFireRef = useRef(new Array(notes.length).fill(null));

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { shiftRef.current = shiftStep; }, [shiftStep]);

  useEffect(() => {
    const prev = statusRef.current;
    statusRef.current = status;

    if (status === 'stopped') {
      startedAtRef.current = null;
      pausedAtRef.current = null;
      lastFireRef.current = new Array(notes.length).fill(null);
    } else if (status === 'playing' && prev === 'stopped') {
      startedAtRef.current = performance.now();
    } else if (status === 'paused' && prev === 'playing') {
      pausedAtRef.current = performance.now();
    } else if (status === 'playing' && prev === 'paused') {
      const pauseDur = performance.now() - pausedAtRef.current;
      startedAtRef.current += pauseDur;
      lastFireRef.current = lastFireRef.current.map(t => t !== null ? t + pauseDur : null);
      pausedAtRef.current = null;
    }
  }, [status, notes.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const total = notes.length;
    const radii = notes.map((_, i) => orbitRadius(i, total));
    const hues = notes.map((_, i) => (i / total) * 360);

    function draw(now) {
      const events = noteEventsRef.current.splice(0);
      for (const ev of events) lastFireRef.current[ev.voiceIndex] = ev.firedAt;

      const effectiveNow = statusRef.current === 'playing'
        ? now
        : (pausedAtRef.current ?? now);

      ctx.clearRect(0, 0, SIZE, SIZE);

      for (let i = 0; i < total; i++) drawTrack(ctx, radii[i], hues[i]);

      for (let i = 0; i < total; i++) {
        const r = radii[i];
        const hue = hues[i];
        const isStarted = startedAtRef.current !== null;

        let angle = -Math.PI / 2;
        if (isStarted) {
          const ms = intervalMs(i, bpmRef.current, shiftRef.current);
          angle = voiceAngle(effectiveNow - startedAtRef.current, ms);
        }

        if (isStarted) drawTrail(ctx, r, hue, angle);

        const x = CX + r * Math.cos(angle);
        const y = CY + r * Math.sin(angle);

        const pulseAge = lastFireRef.current[i] !== null
          ? effectiveNow - lastFireRef.current[i]
          : PULSE_MS;
        const pulseFactor = pulseAge < PULSE_MS ? 1 - pulseAge / PULSE_MS : 0;

        drawDot(ctx, x, y, hue, pulseFactor);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [notes, noteEventsRef]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
