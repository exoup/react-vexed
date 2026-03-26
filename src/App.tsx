import "./index.css";
import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { gemColors, blockSize } from "@/lib/constants";

const levelMap = [
  [1, 1, 1, 1, 1, 1],
  [1, 5, 7, 0, 0, 1],
  [1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 7, 0, 0, 5, 1],
  [1, 1, 7, 5, 1, 1],
  [1, 1, 1, 1, 1, 1],
];

export function App() {
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
    <div className="min-h-screen bg-game-background text-neutral-800 p-4 font-sans flex flex-col items-center justify-center">

      <div
        className="relative bg-transparent shadow-2xl rounded-md overflow-clip select-none touch-none"
        style={{ width: levelMap[0]!.length * blockSize, height: levelMap.length * blockSize }}
      >
        {mapBlocks}
      </div>

    </div>
  );
}

export default App;
