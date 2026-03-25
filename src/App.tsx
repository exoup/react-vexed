import "./index.css";
import { useState, type PointerEvent } from "react";
import { gemColors } from "@/lib/constants";
import Gem from "@/components/Gem";

export function App() {
  const [activeBlock, setActiveBlock] = useState<number | null>(null);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveBlock(1);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveBlock(null);
  };

  return (
    <div className="flex h-dvh w-dvw m-0 bg-linear-to-br from-slate-950 via-zinc-900 to-stone-900">
      <div className="m-auto flex h-1/2 w-1/2 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br bg-zinc-800 shadow-2xl shadow-black/55">

        <div
          style={{ cursor: 'pointer' }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <Gem
            color={gemColors[(Math.floor(Math.random() * gemColors.length) + 1) % gemColors.length]!}
            isSelected={activeBlock === 1}
            size={120}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
