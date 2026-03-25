import React, { useState, useRef, type PointerEvent } from "react";
import { gemColors } from "@/lib/constants";
import Gem from "@/components/Blocks/Gem";

export type GemPieceProps = {
  id: string;
  color?: string;
  size?: number | string;
  type?: string;
  canDrag?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const GemPiece: React.FC<GemPieceProps> = ({
  id,
  color,
  size = 120,
  type = "0",
  canDrag = false
}) => {
  const applyGemColor = () => gemColors[(Math.floor(Math.random() * gemColors.length) + 1) % gemColors.length]!;
  const [gemColor,] = useState<string>(applyGemColor());

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const elementPos = useRef({ x: 0, y: 0 });

  const resetDragState = () => {
    setIsDragging(false);
    setDragDirection(null);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);

    const rect = e.currentTarget.getBoundingClientRect();
    elementPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

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

    const dx = e.clientX - elementPos.current.x;
    const threshold = typeof size === 'number' ? size / 2 : 50;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) setDragDirection('right');
      else if (dx < 0) setDragDirection('left');
    } else setDragDirection(null);
  };

  return (
    <div
      id={id}
      data-type={type}
      data-can-drag={canDrag}
      className="cursor-pointer touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
    >
      <Gem
        color={color || gemColor}
        isSelected={isDragging}
        dragDir={dragDirection}
        size={size}
      />
    </div>
  );
}

export default GemPiece;
