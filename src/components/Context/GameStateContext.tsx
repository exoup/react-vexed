import { loadLevelPack, createInitialBoardState, type BoardState, type BoardDirection, moveGemInBoard } from "@/util/board";
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { useGemState } from "@/components/Context/GemStateContext";

type LevelState = {
    id: number;
    packName: string;
    title: string;
    solution?: string;
    par?: number;
    moveCount: number;
    initialBoardState: BoardState;
    currentBoardState: BoardState;
    gemColorsById: Record<string, string>;
};

type GameStateContextValue = {
    currentLevel: LevelState | null;
    // actions
    // updateBoard: (nextBoardState: BoardState) => void;
    loadPack: (id: number) => Promise<void>;
    moveGem: (gemId: string, direction: BoardDirection) => void;
};

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function GameStateProvider({ children }: PropsWithChildren) {
    const [currentLevel, setCurrentLevel] = useState<LevelState | null>(null);

    const {
        startSliding
    } = useGemState();

    const moveGem = (gemId: string, direction: BoardDirection) => {
        const nextBoardState = moveGemInBoard(currentLevel?.currentBoardState!, gemId, direction);

        if (!nextBoardState) return;

        startSliding(gemId);
        updateBoard(nextBoardState);
    };

    const updateBoard = (nextBoardState: BoardState) => {
        setCurrentLevel((prevLevel) => {
            if (!prevLevel) return prevLevel;

            return {
                ...prevLevel,
                currentBoardState: nextBoardState,
            };
        });
    };

    const loadPack = async (id: number) => {
        const levelPack = await loadLevelPack(id);
        const level = levelPack?.levels[levelPack?.levels.length - 3];
        if (!level || !levelPack) return;

        const { boardState, gemColorsById } = createInitialBoardState(level.board);

        // TODO: Porabably write some kind of level pack level parser

        setCurrentLevel({
            id: 0,
            packName: levelPack.metadata.name,
            title: level.title,
            solution: level.solution ?? undefined,
            par: level.solution ? level.solution.length / 2 : undefined,
            moveCount: 0,
            initialBoardState: boardState.map((row) => [...row]),
            currentBoardState: boardState,
            gemColorsById,
        });
    };

    const value = useMemo(
        () => ({
            currentLevel,
            // updateBoard,
            loadPack,
            moveGem,
        }),
        [currentLevel],
    );

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
