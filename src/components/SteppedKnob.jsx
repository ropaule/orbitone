import { useRef, useEffect } from 'react';
import './Knob.css';
import './SteppedKnob.css';

export const SteppedKnob = ({ label, steps, value, onChange, size = 'm' }) => {
  const sizeMap = { xs: 0.4, s: 0.6, m: 1.0, l: 1.5 };
  const scale = sizeMap[size] || 1.0;

  const currentIndex = steps.findIndex(s => s.value === value);
  const posRef = useRef(currentIndex);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    posRef.current = currentIndex;
  }, [currentIndex]);

  const N = steps.length;
  const center = 50;
  const radius = 40;
  const percentage = currentIndex / (N - 1);
  const pointerAngle = percentage * 270 - 135;

  // Dots placed along the same 270° arc as the track.
  // SVG is CSS-rotated 135°, so the arc stroke begins at SVG's 3 o'clock (east).
  // Using cos/sin in standard screen-space circle coords (0° = east, clockwise).
  const dots = steps.map((_, i) => {
    const angle = (i / (N - 1)) * 270 * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      active: i === currentIndex,
    };
  });

  const handleMouseMove = (e) => {
    const dx = e.clientX - lastPos.current.x;
    const dy = lastPos.current.y - e.clientY;
    const delta = ((dx + dy) / 200) * (N - 1);

    const precisePos = Math.min(N - 1, Math.max(0, posRef.current + delta));
    const newIndex = Math.round(precisePos);

    if (newIndex !== Math.round(posRef.current)) {
      onChange(steps[newIndex].value);
    }

    posRef.current = precisePos;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    lastPos.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
