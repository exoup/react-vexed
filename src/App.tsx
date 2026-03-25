import "./index.css";
import GemPiece from "./components/Game/GemPiece";

export function App() {


  return (
    <div className="flex h-dvh w-dvw m-0 bg-linear-to-br from-slate-950 via-zinc-900 to-stone-900">
      <div className="m-auto flex h-1/2 w-1/2 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br bg-zinc-800 shadow-2xl shadow-black/55">

        <GemPiece id="1" />

      </div>
    </div>
  );
}

export default App;
