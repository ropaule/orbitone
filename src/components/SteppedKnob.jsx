import { useRef, useEffect } from 'react';
import { sizeMap } from './Knob';
import './Knob.css';
import './SteppedKnob.css';
import { useMouseDrag } from '../hooks/useMouseDrag';

export const SteppedKnob = ({ label, steps, value, onChange, size = 'm' }) => {
  const scale = sizeMap[size] || 1.0;

  const currentIndex = steps.findIndex(s => s.value === value);
  const posRef = useRef(currentIndex);

  useEffect(() => {
    posRef.current = currentIndex;
  }, [currentIndex]);

  const N = steps.length;
  const center = 50;
  const radius = 40;
  const percentage = currentIndex / (N - 1);
  const pointerAngle = percentage * 270 - 135;

  // Dots along the 270° arc. SVG is CSS-rotated 135°, so arc begins at SVG's 3 o'clock.
  const dots = steps.map((_, i) => {
    const angle = (i / (N - 1)) * 270 * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      active: i === currentIndex,
    };
  });

  const handleMouseDown = useMouseDrag((normalizedDelta) => {
    const precisePos = Math.min(N - 1, Math.max(0, posRef.current + normalizedDelta * (N - 1)));
    const newIndex = Math.round(precisePos);
    if (newIndex !== Math.round(posRef.current)) onChange(steps[newIndex].value);
    posRef.current = precisePos;
  });

  return (
    <div className="knob-container" style={{ '--knob-scale': scale }}>
      <div className="knob-wrapper" onMouseDown={handleMouseDown}>
        <svg viewBox="0 0 100 100" className="knob-svg">
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.active ? 3.5 : 2.5}
              className={dot.active ? 'step-dot step-dot--active' : 'step-dot'}
            />
          ))}
        </svg>
        <div className="knob-disk">
          <div className="knob-pointer" style={{ transform: `rotate(${pointerAngle}deg)` }} />
        </div>
      </div>
      <label className="knob-label">{label}</label>
      <span className="knob-value-display">{steps[currentIndex]?.label}</span>
    </div>
  );
};
