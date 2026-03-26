import "./index.css";
import GemBlock from "@/components/Game/GemBlock";
import BoundaryBlock from "@/components/Game/BoundaryBlock";

const levelMap = [
  [1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1],
];

export function App() {
  const boundaryBlocks = levelMap.flatMap((row, y) =>
    row.flatMap((cell, x) => {
      if (!cell) return null;

      return (
        <BoundaryBlock
          key={`boundary-${x}-${y}`}
          x={x}
          y={y}
          levelMap={levelMap}
        />
      );
    }),
  );

  return (
    <div className="flex h-dvh w-dvw m-0 bg-linear-to-br from-slate-950 via-zinc-900 to-stone-900">
      <div className="relative m-auto flex h-1/2 w-1/2 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br bg-zinc-800 shadow-2xl shadow-black/55">
        {boundaryBlocks}
        <GemBlock id="1" />
        <GemBlock id="2" />
      </div>
    </div>
  );
}

export default App;
