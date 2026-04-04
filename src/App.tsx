import "./index.css";
import { GameStateProvider } from "@/components/Context/GameStateContext";
import Board from "@/components/Game/Board";
import { GemStateProvider } from "@/components/Context/GemStateContext";

export function App() {

  return (
    <GemStateProvider>
      <GameStateProvider>
        <div className="min-h-screen bg-game-background text-neutral-800 p-4 font-sans flex flex-col items-center justify-center">
          <Board />
        </div>
      </GameStateProvider>
    </GemStateProvider>
  );
}

export default App;
