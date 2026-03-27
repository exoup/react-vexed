import React, { useState, useRef, type PointerEvent } from "react";
import { gemColors, blockSize } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Gem from "@/components/Blocks/Gem";

type MoveDirection = "left" | "right";

export type GemBlockProps = {
  x?: number,
  y?: number,
  id: string;
  color?: string;
  size?: number | string;
  onMove?: (id: string, direction: MoveDirection) => void;
};

export const GemBlock: React.FC<GemBlockProps> = ({
  x = 0,
  y = 0,
  id,
  color,
  size = blockSize,
  onMove,
}) => {
  const applyGemColor = () => gemColors[(Math.floor(Math.random() * gemColors.length) + 1) % gemColors.length]!;
  const [gemColor,] = useState<string>(applyGemColor());

  const gemSize = typeof size === "number" ? size : 120;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const elementPos = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);

  const resetDragState = () => {
    setIsDragging(false);
    setDragDirection(null);
    activeRef.current = false;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    activeRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    elementPos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;

    if (dragDirection === null) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      resetDragState();
      return;
    }

    onMove?.(id, dragDirection);

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
    if (!isDragging || !activeRef.current) return;

    const dx = e.clientX - elementPos.current.x;
    const threshold = gemSize / 2;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) setDragDirection('right');
      else if (dx < 0) setDragDirection('left');
    } else setDragDirection(null);
  };

  return (
    <div
      id={id}
      style={{
        transform: `translate3d(${x * blockSize}px, ${y * blockSize}px, 0)`,
        width: blockSize,
        height: blockSize
      }}
      className={cn(
        "absolute cursor-pointer touch-none transition-transform duration-250 ease-in-out",
        activeRef.current ? "z-20" : "z-10",
      )}
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

export default GemBlock;
