import { useRef, useEffect } from 'react';
import { sharedAnalyser } from '../audio/analyser';

// Draw one blurred filled-path layer of the cloud shape.
function drawLayer(ctx, pts, w, h, blur, hue, alphaBase, alphaTop) {
  ctx.save();
  ctx.filter = `blur(${blur}px)`;

  const grad = ctx.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, `hsla(${hue},     72%, 45%, ${alphaBase})`);
  grad.addColorStop(0.5, `hsla(${hue - 10}, 80%, 60%, ${alphaBase * 0.6})`);
  grad.addColorStop(1, `hsla(${hue - 20}, 90%, 75%, ${alphaTop})`);

  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

export function EQVisualiser() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const smoothRef = useRef(null); // previous-frame values for extra smoothing

  // Keep canvas pixel dimensions in sync with its CSS size.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ro = new ResizeObserver(([entry]) => {
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw(now) {
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) { rafRef.current = requestAnimationFrame(draw); return; }

      // --- Read & normalize FFT data ---
      const raw = sharedAnalyser.getValue(); // Float32Array, dB
      const N = raw.length;

      if (!smoothRef.current || smoothRef.current.length !== N) {
        smoothRef.current = new Float32Array(N);
      }

      const t = now / 1000;
      for (let i = 0; i < N; i++) {
        // Normalize dB (-90..0) → 0..1
        const fft = Math.max(0, Math.min(1, (raw[i] + 90) / 90));
        // Gentle idle breathing so the visualiser is never flat
        const idle = 0.04 * (0.5 + 0.5 * Math.sin(t * 0.55 + i * 0.32));
        const target = Math.max(fft, idle);
        // Extra smoothing on top of Tone.js's own smoothing
        smoothRef.current[i] = smoothRef.current[i] * 0.55 + target * 0.45;
      }

      // --- Build control points ---
      // Use every other bin so the curve has fewer, wider bumps (more "cloudy")
      const step = 2;
      const pts = [];
      for (let i = 0; i < N; i += step) {
        pts.push({
          x: (i / (N - 1)) * W,
          y: H - smoothRef.current[i] * H * 0.88,
        });
      }
      // Ensure we hit the right edge
      pts[pts.length - 1].x = W;

      ctx.clearRect(0, 0, W, H);

      // Three blur layers — wide cloud base → medium glow → crisp top
      drawLayer(ctx, pts, W, H, 30, 225, 0.50, 0.00);
      drawLayer(ctx, pts, W, H, 11, 215, 0.60, 0.04);
      drawLayer(ctx, pts, W, H,  3, 200, 0.70, 0.10);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
