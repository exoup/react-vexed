import "./index.css";
import Board from "@/components/Game/Board";

export function App() {

  return (
    <div className="min-h-screen bg-game-background text-neutral-800 p-4 font-sans flex flex-col items-center justify-center">
      <Board />
    </div>
  );
}

export default App;
