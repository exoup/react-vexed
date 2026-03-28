import React, { useEffect, useRef, useState, type PointerEvent } from "react";
import { useGemState } from "@/components/Game/GemStateContext";
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
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onMove?: (id: string, direction: MoveDirection) => void;
};

export const GemBlock: React.FC<GemBlockProps> = ({
  x = 0,
  y = 0,
  id,
  color,
  size = blockSize,
  canMoveLeft = true,
  canMoveRight = true,
  onMove,
}) => {
  const applyGemColor = () => gemColors[(Math.floor(Math.random() * gemColors.length) + 1) % gemColors.length]!;
  const [gemColor,] = useState<string>(applyGemColor());
  const [renderedPosition, setRenderedPosition] = useState({ x, y });
  const {
    slidingGemIds,
    finishSliding,
    fallingGemIds,
    finishFalling,
    clearingGemIds,
    finishClearing,
  } = useGemState();

  const gemSize = typeof size === "number" ? size : 120;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const elementPos = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const isSliding = slidingGemIds.has(id);
  const isFalling = fallingGemIds.has(id);
  const isClearing = clearingGemIds.has(id);

  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setRenderedPosition({ x, y });
    });

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [x, y]);

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
    if (Math.abs(dx) <= threshold) {
      setDragDirection(null);
      return;
    }

    if (dx > 0) {
      setDragDirection(canMoveRight ? 'right' : null);
      return;
    }

    if (dx < 0) {
      setDragDirection(canMoveLeft ? 'left' : null);
      return;
    }

    setDragDirection(null);
  };

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    if (isSliding) {
      finishSliding(id);
      return;
    }

    if (isFalling) {
      finishFalling(id);
    }
  };

  const handleAnimationEnd = () => {
    if (!isClearing) return;

    finishClearing(id);
  };

  return (
    <div
      id={id}
      style={{
        transform: `translate3d(${renderedPosition.x * blockSize}px, ${renderedPosition.y * blockSize}px, 0)`,
        width: blockSize,
        height: blockSize
      }}
      className={cn(
        "absolute cursor-pointer touch-none transition-transform",
        isSliding ? "duration-270 ease-in-out" : "duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        activeRef.current ? "z-20" : "z-10",
        isClearing && "pointer-events-none",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={cn(
          "h-full w-full",
          isClearing && "animate-[gem-clear_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]",
        )}
        onAnimationEnd={handleAnimationEnd}
      >
        <Gem
          color={color || gemColor}
          isSelected={isDragging}
          dragDir={dragDirection}
          size={size}
        />
      </div>
    </div>
  );
}

export default GemBlock;
