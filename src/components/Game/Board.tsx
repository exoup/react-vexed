import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { useGameState } from "@/components/Context/GameStateContext";
import { useGemState } from "@/components/Context/GemStateContext";
import { blockSize } from "@/lib/constants";
import {
    isGemCell,
} from "@/util/board";

function BoardContent() {
    const { currentLevel, moveGem } = useGameState();
    if (!currentLevel) return null;

    const { currentBoardState, initialBoardState, gemColorsById } = currentLevel;

    const boundaryLevelMap = initialBoardState.map((row) =>
        row.map((cell) => (cell === 1 ? 1 : 0)),
    );

    const { isInteractionLocked } = useGemState();

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
            <button className="p-3 mb-10 cursor-pointer active:bg-indigo-600 z-50 bg-indigo-500 text-white text-sm rounded-md" onClick={() => loadPack(1)}>Load Pack</button>
            <BoardContent />
        </>
    );
}

export default Board;
