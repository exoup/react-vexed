import { useEffect, useState } from "react";

import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { GemStateProvider, useGemState } from "@/components/Game/GemStateContext";
import { gemColors, blockSize } from "@/lib/constants";
import {
    applyGravity,
    createInitialBoardState,
    findMatches,
    isGemCell,
    moveGemInBoard,
    removeMatchedGems,
    type BoardDirection,
    type BoardState,
} from "@/util/board";

const levelMap = [
    [1, 1, 1, 1, 1, 1],
    [1, 7, 8, 0, 0, 1],
    [1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 8, 0, 0, 7, 1],
    [1, 1, 0, 7, 1, 1],
    [1, 1, 1, 1, 1, 1],
];

const boundaryLevelMap = levelMap.map((row) =>
    row.map((cell) => (cell === 1 ? 1 : 0)),
);

const { boardState: initialBoardState, gemColorsById } = createInitialBoardState(levelMap, gemColors);

function BoardContent() {
    const [boardState, setBoardState] = useState<BoardState>(initialBoardState);
    const {
        slidingGemIds,
        startSliding,
        fallingGemIds,
        startFalling,
    } = useGemState();

    const moveGem = (gemId: string, direction: BoardDirection) => {
        setBoardState((currentBoardState) => {
            const nextBoardState = moveGemInBoard(currentBoardState, gemId, direction);

            if (!nextBoardState) return currentBoardState;

            startSliding(gemId);
            return nextBoardState;
        });
    };

    useEffect(() => {
        if (slidingGemIds.size > 0) return;
        if (fallingGemIds.size > 0) return;

        const gravityResult = applyGravity(boardState, slidingGemIds);
        if (gravityResult.hasChanged) {
            gravityResult.fallingGemIds.forEach((gemId) => {
                startFalling(gemId);
            });
            setBoardState(gravityResult.boardState);
            return;
        }

        const matchedGemIds = findMatches(boardState);
        if (matchedGemIds.size === 0) return;

        setBoardState(removeMatchedGems(boardState, matchedGemIds));
    }, [boardState, fallingGemIds, slidingGemIds, startFalling]);

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
