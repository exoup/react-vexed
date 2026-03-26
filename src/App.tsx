import "./index.css";
import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";
import { gemColors } from "@/lib/constants";

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
          color={gemColors[cell-2]}
          id={`${cell}-${x}-${y}`}
          key={`gem-${x}-${y}`}
          x={x}
          y={y}
        />
      );
    }),
  );

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 mx-auto h-1/2 w-1/2 rounded-2xl">
      {mapBlocks}
    </div>
  );
}

export default App;
