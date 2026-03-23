import React, { useState, useRef, useEffect } from 'react';
import './Knob.css';

export const Knob = ({ label, min = 0, max = 100, value = 0, onChange, size = "m" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sizeMap = { xs: 0.4,s: 0.6, m: 1.0, l: 1.5 };
  const scale = sizeMap[size] || 1.0;

  const lastPos = useRef({ x: 0, y: 0 });
  const valueRef = useRef(Number(value));

  useEffect(() => {
    valueRef.current = Number(value);
  }, [value]);

  // --- SVG CONSTANTS (Internal coordinates are ALWAYS 100x100) ---
  const INTERNAL_SIZE = 100;
  const center = INTERNAL_SIZE / 2;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcPercent = 0.75; 
  const fullArcLength = circumference * arcPercent;
  
  const percentage = (value - min) / (max - min);
  const dashArray = `${fullArcLength} ${circumference}`;
  const dashOffset = fullArcLength * (1 - percentage);

  // --- MOUSE LOGIC ---
  const handleMouseMove = (e) => {
    const dx = e.clientX - lastPos.current.x;
    const dy = lastPos.current.y - e.clientY; 
    
    const pixelRange = 200; 
    const movementPercent = (dx + dy) / pixelRange;
    const valueDelta = movementPercent * (max - min);
    
    const preciseValue = Math.min(max, Math.max(min, valueRef.current + valueDelta));
    const roundedValue = Math.round(preciseValue);

    if (roundedValue !== Math.round(valueRef.current)) {
      onChange(roundedValue);
    }

    valueRef.current = preciseValue; 
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="knob-container" style={{ "--knob-scale": scale }}>
      <div className="knob-wrapper" onMouseDown={handleMouseDown}>
        
        {/* ADDED viewBox="0 0 100 100" - THIS FIXES THE RADIUS BUG */}
        <svg viewBox="0 0 100 100" className="knob-svg">
          <circle
            cx={center} cy={center} r={radius}
            className="knob-track"
            strokeDasharray={dashArray}
            strokeDashoffset="0"
          />
          <circle
            cx={center} cy={center} r={radius}
            className="knob-progress"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="knob-disk">
          <div 
            className="knob-pointer" 
            style={{ transform: `rotate(${(percentage * 270) - 135}deg)` }} 
          />
        </div>
      </div>
      
      <label className="knob-label">{label}</label>
      <span className="knob-value-display">{value}</span>
    </div>
  );
};