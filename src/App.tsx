import "./index.css";
import { useState, useRef, type PointerEvent } from "react";
import { gemColors } from "@/lib/constants";
import Gem from "@/components/Gem";

export function App() {
  const applyGemColor = () => gemColors[(Math.floor(Math.random() * gemColors.length) + 1) % gemColors.length]!;
  const [gemColor, setGemColor] = useState<string>(applyGemColor());

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const pointerPos = useRef({ x: 0, y: 0 });

  const resetDragState = () => {
    setIsDragging(false);
    setDragDirection(null);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    pointerPos.current = ({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    // Handle release behavior for movement

    // Cleanup
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetDragState();
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resetDragState();
  };

  const handleLostPointerCapture = () => {
    resetDragState();
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - pointerPos.current.x;
    const threshold = 50;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) setDragDirection('right');
      else if (dx < 0) setDragDirection('left');
    } else setDragDirection(null);
  };

  return (
    <div className="flex h-dvh w-dvw m-0 bg-linear-to-br from-slate-950 via-zinc-900 to-stone-900">
      <div className="m-auto flex h-1/2 w-1/2 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br bg-zinc-800 shadow-2xl shadow-black/55">

        <div
          className="cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
        >
          <Gem
            color={gemColor}
            isSelected={isDragging}
            dragDir={dragDirection}
            size={120}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
