import { useEffect, useState } from "react";

import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { GemStateProvider, useGemState } from "@/components/Game/GemStateContext";
import { gemColors, blockSize } from "@/lib/constants";

const levelMap = [
    [1, 1, 1, 1, 1, 1],
    [1, 7, 8, 0, 0, 1],
    [1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 8, 0, 0, 7, 1],
    [1, 1, 0, 7, 1, 1],
    [1, 1, 1, 1, 1, 1],
];

type BoardDirection = "left" | "right";
type BoardCell = 0 | 1 | string;
type BoardState = BoardCell[][];

const boundaryLevelMap = levelMap.map((row) =>
    row.map((cell) => (cell === 1 ? 1 : 0)),
);

const createGemId = (cell: number, x: number, y: number) => {
    return `gem-${cell}-${x}-${y}`;
};

const createInitialBoardState = (map: number[][]) => {
    const gemColorsById: Record<string, string> = {};

    const boardState: BoardState = map.map((row, y) =>
        row.map((cell, x) => {
            if (cell <= 1) return cell as 0 | 1;

            const gemId = createGemId(cell, x, y);
            gemColorsById[gemId] = gemColors[cell - 2] ?? gemColors[0]!;
            return gemId;
        }),
    );

    return { boardState, gemColorsById };
};

const { boardState: initialBoardState, gemColorsById } = createInitialBoardState(levelMap);

const isGemCell = (cell: BoardCell): cell is string => {
    return typeof cell === "string";
};

function BoardContent() {
    const [boardState, setBoardState] = useState<BoardState>(initialBoardState);
    const { slidingGemIds, startSliding } = useGemState();

    const moveGem = (gemId: string, direction: BoardDirection) => {
        setBoardState((currentBoardState) => {
            let gemPosition: { x: number, y: number } | null = null;

            for (let y = 0; y < currentBoardState.length; y += 1) {
                const x = currentBoardState[y]!.findIndex((cell) => cell === gemId);

                if (x !== -1) {
                    gemPosition = { x, y };
                    break;
                }
            }

            if (!gemPosition) return currentBoardState;

            const { x: currentX, y: currentY } = gemPosition;
            const targetX = currentX + (direction === "left" ? -1 : 1);
            const targetCell = currentBoardState[currentY]?.[targetX];

            if (targetCell !== 0) return currentBoardState;

            startSliding(gemId);

            return currentBoardState.map((row, y) => {
                if (y !== currentY) return row;

                return row.map((cell, x) => {
                    if (x === currentX) return 0;
                    if (x === targetX) return gemId;
                    return cell;
                });
            });
        });
    };

    useEffect(() => {
        if (slidingGemIds.size > 0) return;

        const nextBoardState = boardState.map((row) => [...row]);
        let hasAnyFallingGem = false;

        for (let x = 0; x < nextBoardState[0]!.length; x += 1) {
            for (let y = nextBoardState.length - 2; y >= 0; y -= 1) {
                const currentCell = nextBoardState[y]![x]!;
                if (!isGemCell(currentCell)) continue;
                if (slidingGemIds.has(currentCell)) continue;

                let targetY = y;

                while (nextBoardState[targetY + 1]?.[x] === 0) {
                    targetY += 1;
                }

                if (targetY === y) continue;

                nextBoardState[y]![x] = 0;
                nextBoardState[targetY]![x] = currentCell;
                hasAnyFallingGem = true;
            }
        }

        if (!hasAnyFallingGem) return;

        setBoardState(nextBoardState);
    }, [boardState, slidingGemIds]);

    const mapBlocks = boardState.flatMap((row, y) =>
        row.flatMap((cell, x) => {
            if (cell === 1) return (
                <BoundaryBlock
                    key={`boundary-${x}-${y}`}
                    x={x}
                    y={y}
                    levelMap={boundaryLevelMap}
                />
            );

            if (isGemCell(cell)) return (
                <GemBlock
                    canMoveLeft={row[x - 1] === 0}
                    canMoveRight={row[x + 1] === 0}
                    color={gemColorsById[cell]}
                    id={cell}
                    key={cell}
                    onMove={moveGem}
                    x={x}
                    y={y}
                />
            );

            return null;
        }),
    );

    return (
        <div
            className="relative bg-transparent border-t border-l border-t-boundary-edge/50 border-l-boundary-edge/50 shadow-2xl rounded-xs overflow-clip select-none touch-none"
            style={{ width: levelMap[0]!.length * blockSize, height: levelMap.length * blockSize }}
        >
            {mapBlocks}
        </div>
    );
}

export function Board() {
    return (
        <GemStateProvider>
            <BoardContent />
        </GemStateProvider>
    );
}

export default Board;
