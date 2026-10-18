import { useRef, useState, type ReactNode, type PointerEvent } from 'react';

interface Props {
  active: number;
  onChange: (index: number) => void;
  children: ReactNode[];
}

/**
 * The lines sit side by side like faces of a slowly turning drum. Swipe (touch) or use the
 * tabs and arrow keys to turn it; neighbouring lines peek in at the edges.
 */
export function Carousel({ active, onChange, children }: Props) {
  const [drag, setDrag] = useState(0);
  const gesture = useRef<{ x: number; y: number; id: number; width: number; axis?: 'x' | 'y' } | null>(null);
  const count = children.length;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return; // mouse users turn with tabs, arrows or a click on a neighbour
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, width: e.currentTarget.clientWidth };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (g.axis !== 'x') return;
    const atEdge = (active === 0 && dx > 0) || (active === count - 1 && dx < 0);
    setDrag(atEdge ? dx / 3 : dx);
  };

  const end = () => {
    const g = gesture.current;
    if (g?.axis === 'x' && Math.abs(drag) > g.width * 0.18) {
      onChange(Math.max(0, Math.min(count - 1, active + (drag < 0 ? 1 : -1))));
    }
    gesture.current = null;
    setDrag(0);
  };

  const width = gesture.current?.width ?? 1;
  const dragging = drag !== 0;

  return (
    <div
      className="carousel"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {children.map((child, i) => {
        const offset = i - active + drag / width;
        const distance = Math.min(Math.abs(offset), 1.5);
        const isActive = i === active;
        return (
          <div
            key={i}
            className={`panel${isActive ? ' is-active' : ''}`}
            style={{
              transform: `translateX(calc(${offset} * (100% + 14px))) rotateY(${offset * -28}deg) scale(${1 - distance * 0.07})`,
              opacity: 1 - distance * 0.5,
              transition: dragging ? 'none' : undefined,
              zIndex: 10 - Math.round(distance * 4),
            }}
            aria-hidden={!isActive}
            onClickCapture={(e) => {
              if (isActive) return;
              e.preventDefault();
              e.stopPropagation();
              onChange(i);
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
