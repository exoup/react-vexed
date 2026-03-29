import {
    createContext,
    useContext,
    useMemo,
    type PropsWithChildren,
} from "react";

type GameStateContextValue = {
};

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function GameStateProvider({ children }: PropsWithChildren) {

    const value = useMemo<GameStateContextValue>(() => ({
    }), []);

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
}

export function useGameState() {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error("useGameState must be used within a GameStateProvider");
    }

    return context;
}
