import "./index.css";
import { GameStateProvider } from "@/components/Context/GameStateContext";
import Board from "@/components/Game/Board";

export function App() {

  return (
    <GameStateProvider>
      <div className="min-h-screen bg-game-background text-neutral-800 p-4 font-sans flex flex-col items-center justify-center">
        <Board />
      </div>
    </GameStateProvider>
  );
}

export default App;
