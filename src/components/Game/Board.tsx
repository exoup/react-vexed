import { useEffect, useState } from "react";

import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { useGameState } from "@/components/Context/GameStateContext"
import { GemStateProvider, useGemState } from "@/components/Context/GemStateContext";
import { blockSize } from "@/lib/constants";
import {
    applyGravity,
    findMatches,
    isGemCell,
    moveGemInBoard,
    removeMatchedGems,
    hasEmpty,
    hasOrphans,
    type BoardDirection,
} from "@/util/board";

function BoardContent() {
    const { currentLevel, updateBoard } = useGameState();
    if (!currentLevel) return null;

    const { currentBoardState, initialBoardState, gemColorsById, title, par, solution } = currentLevel;

    const boundaryLevelMap = initialBoardState.map((row) =>
        row.map((cell) => (cell === 1 ? 1 : 0)),
    );

    // const [boardState, setBoardState] = useState<BoardState>(initialBoardState);
    const [pendingMatchedGemIds, setPendingMatchedGemIds] = useState<Set<string>>(new Set());
    const {
        slidingGemIds,
        startSliding,
        fallingGemIds,
        startFalling,
        clearingGemIds,
        startClearing,
        isInteractionLocked,
        isBoardSettled
    } = useGemState();

    const moveGem = (gemId: string, direction: BoardDirection) => {
        const nextBoardState = moveGemInBoard(currentBoardState, gemId, direction);

        if (!nextBoardState) return;

        startSliding(gemId);
        updateBoard(nextBoardState);
    };

    useEffect(() => {
        if (slidingGemIds.size > 0) return;
        if (fallingGemIds.size > 0) return;
        if (pendingMatchedGemIds.size > 0) {
            if (clearingGemIds.size > 0) return;

            updateBoard(removeMatchedGems(currentBoardState, pendingMatchedGemIds));
            setPendingMatchedGemIds(new Set());
            return;
        }

        const gravityResult = applyGravity(currentBoardState, slidingGemIds);
        if (gravityResult.hasChanged) {
            gravityResult.fallingGemIds.forEach((gemId) => {
                startFalling(gemId);
            });
            updateBoard(gravityResult.boardState);
            return;
        }

        const matchedGemIds = findMatches(currentBoardState);
        if (matchedGemIds.size === 0) return;

        matchedGemIds.forEach((gemId) => {
            startClearing(gemId);
        });
        setPendingMatchedGemIds(matchedGemIds);
    }, [
        currentBoardState,
        clearingGemIds,
        fallingGemIds,
        pendingMatchedGemIds,
        slidingGemIds,
        startClearing,
        startFalling,
    ]);

    useEffect(() => {
        if (!isBoardSettled && pendingMatchedGemIds.size !== 0) return;
        hasEmpty(currentBoardState)
        hasOrphans(currentBoardState)
    }, [currentBoardState, isBoardSettled, pendingMatchedGemIds])

    const mapBlocks = currentBoardState.flatMap((row, y) =>
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
                    isInteractionLocked={isInteractionLocked}
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
            className="relative bg-transparent border-t border-l border-t-boundary-edge/50 border-l-boundary-edge/50 shadow-2xl rounded-xs select-none touch-none"
            style={{ width: initialBoardState[0]!.length * blockSize, height: initialBoardState.length * blockSize }}
        >
            {mapBlocks}
        </div>
    );
}

export function Board() {
    const { loadPack } = useGameState();
    return (
        <>
            <button className="p-3 mb-10 cursor-pointer active:bg-indigo-600 z-50 bg-indigo-500 text-white text-sm rounded-md" onClick={() => loadPack(0)}>Load Pack</button>
            <GemStateProvider>
                <BoardContent />
            </GemStateProvider>
        </>
    );
}

export default Board;
