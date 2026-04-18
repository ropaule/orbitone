import { useRef, useEffect } from 'react';
import './Knob.css';
import { useMouseDrag } from '../hooks/useMouseDrag';

export const sizeMap = { xs: 0.4, s: 0.6, m: 1.0, l: 1.5 };

export const Knob = ({ label, min = 0, max = 100, value = 0, onChange, size = "m" }) => {
  const scale = sizeMap[size] || 1.0;
  const valueRef = useRef(Number(value));

  useEffect(() => {
    valueRef.current = Number(value);
  }, [value]);

  const center = 50;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const fullArcLength = circumference * 0.75;
  const percentage = (value - min) / (max - min);
  const dashArray = `${fullArcLength} ${circumference}`;
  const dashOffset = fullArcLength * (1 - percentage);

  const handleMouseDown = useMouseDrag((normalizedDelta) => {
    const preciseValue = Math.min(max, Math.max(min, valueRef.current + normalizedDelta * (max - min)));
    const roundedValue = Math.round(preciseValue);
    if (roundedValue !== Math.round(valueRef.current)) onChange(roundedValue);
    valueRef.current = preciseValue;
  });

  return (
    <div className="knob-container" style={{ "--knob-scale": scale }}>
      <div className="knob-wrapper" onMouseDown={handleMouseDown}>
        <svg viewBox="0 0 100 100" className="knob-svg">
          <circle cx={center} cy={center} r={radius} className="knob-track" strokeDasharray={dashArray} strokeDashoffset="0" />
          <circle cx={center} cy={center} r={radius} className="knob-progress" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
        </svg>
        <div className="knob-disk">
          <div className="knob-pointer" style={{ transform: `rotate(${(percentage * 270) - 135}deg)` }} />
        </div>
      </div>
      <label className="knob-label">{label}</label>
      <span className="knob-value-display">{value}</span>
    </div>
  );
};
