import { useRef } from 'react';

// Returns an onMouseDown handler. onDelta receives normalized movement: (dx+dy) / 200px.
// Handlers are created once (stable refs) and always call the latest onDelta via a ref.
export function useMouseDrag(onDelta) {
  const onDeltaRef = useRef(onDelta);
  onDeltaRef.current = onDelta;

  const handlersRef = useRef(null);
  if (!handlersRef.current) {
    const lastPos = { x: 0, y: 0 };
    const move = (e) => {
      const dx = e.clientX - lastPos.x;
      const dy = lastPos.y - e.clientY;
      onDeltaRef.current((dx + dy) / 200);
      lastPos.x = e.clientX;
      lastPos.y = e.clientY;
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    handlersRef.current = { move, up, lastPos };
  }

  return (e) => {
    handlersRef.current.lastPos.x = e.clientX;
    handlersRef.current.lastPos.y = e.clientY;
    window.addEventListener('mousemove', handlersRef.current.move);
    window.addEventListener('mouseup', handlersRef.current.up);
  };
}
