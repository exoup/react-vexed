import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { gemColors, blockSize } from "@/lib/constants";

const levelMap = [
    [1, 1, 1, 1, 1, 1],
    [1, 7, 8, 0, 0, 1],
    [1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 8, 0, 0, 7, 1],
    [1, 1, 8, 7, 1, 1],
    [1, 1, 1, 1, 1, 1],
];

export function Board() {
    const mapBlocks = levelMap.flatMap((row, y) =>
        row.flatMap((cell, x) => {
            if (!cell) return null;

            if (cell === 1) return (
                <BoundaryBlock
                    key={`boundary-${x}-${y}`}
                    x={x}
                    y={y}
                    levelMap={levelMap}
                />
            );

            if (cell > 1) return (
                <GemBlock
                    color={gemColors[cell - 2]}
                    id={`${cell}-${x}-${y}`}
                    key={`gem-${x}-${y}`}
                    x={x}
                    y={y}
                />
            );
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

export default Board;
