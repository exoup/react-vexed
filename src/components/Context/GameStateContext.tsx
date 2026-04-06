import {
    applyGravity,
    createInitialBoardState,
    findMatches,
    hasEmpty,
    hasOrphans,
    loadLevelPack,
    moveGemInBoard,
    removeMatchedGems,
    type BoardDirection,
    type BoardState,
} from "@/util/board";
import {
    createContext,
    useContext,
    useEffect,
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

type LevelHistoryState = {
    past: LevelState[];
    present: LevelState | null;
    future: LevelState[];
};

type GameStateContextValue = {
    currentLevel: LevelState | null;
    hasOrphanedGems: boolean;
    isLevelCleared: boolean;
    canUndo: boolean;
    canRedo: boolean;
    // actions
    loadPack: (id: number) => Promise<void>;
    moveGem: (gemId: string, direction: BoardDirection) => void;
    undo: () => void;
    redo: () => void;
};

const GameStateContext = createContext<GameStateContextValue | null>(null);
const initialLevelHistoryState: LevelHistoryState = {
    past: [],
    present: null,
    future: [],
};

export function GameStateProvider({ children }: PropsWithChildren) {
    const [currentLevel, setCurrentLevel] = useState<LevelState | null>(null);
    const [history, setHistory] = useState<LevelHistoryState>(initialLevelHistoryState);
    const [pendingMatchedGemIds, setPendingMatchedGemIds] = useState<Set<string>>(new Set());

    const {
        clearingGemIds,
        fallingGemIds,
        isBoardSettled,
        resetTransientState,
        slidingGemIds,
        startClearing,
        startFalling,
        startSliding,
    } = useGemState();

    const gravityPreview = currentLevel
        ? applyGravity(currentLevel.currentBoardState, new Set<string>())
        : null;
    const isBoardReadyForValidation = Boolean(currentLevel)
        && isBoardSettled
        && pendingMatchedGemIds.size === 0
        && !gravityPreview?.hasChanged;
    const isLevelCleared = isBoardReadyForValidation && currentLevel
        ? hasEmpty(currentLevel.currentBoardState)
        : false;
    const hasOrphanedGems = isBoardReadyForValidation && currentLevel
        ? hasOrphans(currentLevel.currentBoardState)
        : false;

    const canUndo = isBoardSettled && history.past.length > 0;
    const canRedo = isBoardSettled && history.future.length > 0;

    const clearTransientBoardState = () => {
        resetTransientState();
        setPendingMatchedGemIds(new Set());
    };

    const undo = () => {
        if (!isBoardSettled) return;

        const previousLevel = history.past[history.past.length - 1];
        if (!previousLevel) return;

        clearTransientBoardState();
        setCurrentLevel(previousLevel);
        setHistory({
            past: history.past.slice(0, -1),
            present: previousLevel,
            future: history.present ? [history.present, ...history.future] : history.future,
        });
    };

    const redo = () => {
        if (!isBoardSettled) return;

        const nextLevel = history.future[0];
        if (!nextLevel) return;

        clearTransientBoardState();
        setCurrentLevel(nextLevel);
        setHistory({
            past: history.present ? [...history.past, history.present] : history.past,
            present: nextLevel,
            future: history.future.slice(1),
        });
    };

    const moveGem = (gemId: string, direction: BoardDirection) => {
        if (!currentLevel) return;
        if (!isBoardSettled) return;

        const nextBoardState = moveGemInBoard(currentLevel.currentBoardState, gemId, direction);

        if (!nextBoardState) return;

        startSliding(gemId);
        setCurrentLevel({
            ...currentLevel,
            moveCount: currentLevel.moveCount + 1,
            currentBoardState: nextBoardState,
        });
    };

    useEffect(() => {
        if (!currentLevel) return;
        if (slidingGemIds.size > 0) return;
        if (fallingGemIds.size > 0) return;

        if (pendingMatchedGemIds.size > 0) {
            if (clearingGemIds.size > 0) return;

            setCurrentLevel((previousLevel) => {
                if (!previousLevel) return previousLevel;

                return {
                    ...previousLevel,
                    currentBoardState: removeMatchedGems(previousLevel.currentBoardState, pendingMatchedGemIds),
                };
            });
            setPendingMatchedGemIds(new Set());
            return;
        }

        const gravityResult = applyGravity(currentLevel.currentBoardState, slidingGemIds);
        if (gravityResult.hasChanged) {
            gravityResult.fallingGemIds.forEach((gemId) => {
                startFalling(gemId);
            });

            setCurrentLevel((previousLevel) => {
                if (!previousLevel) return previousLevel;

                return {
                    ...previousLevel,
                    currentBoardState: gravityResult.boardState,
                };
            });
            return;
        }

        const matchedGemIds = findMatches(currentLevel.currentBoardState);
        if (matchedGemIds.size === 0) return;

        matchedGemIds.forEach((gemId) => {
            startClearing(gemId);
        });
        setPendingMatchedGemIds(matchedGemIds);
    }, [
        clearingGemIds,
        currentLevel,
        fallingGemIds,
        pendingMatchedGemIds,
        slidingGemIds,
        startClearing,
        startFalling,
    ]);

    useEffect(() => {
        if (!currentLevel) return;
        if (!isBoardSettled) return;
        if (!isLevelCleared) return;

        const timeoutId = window.setTimeout(() => {
            loadNextLevel();
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [currentLevel, isBoardSettled, isLevelCleared]);

    useEffect(() => {
        if (!currentLevel) return;
        if (!isBoardSettled) return;
        if (pendingMatchedGemIds.size > 0) return;
        if (history.present === currentLevel) return;

        const gravityPreview = applyGravity(currentLevel.currentBoardState, new Set<string>());
        if (gravityPreview.hasChanged) return;

        const matchedGemIds = findMatches(currentLevel.currentBoardState);
        if (matchedGemIds.size > 0) return;

        setHistory((currentHistory) => {
            if (currentHistory.present === currentLevel) return currentHistory;

            if (!currentHistory.present) {
                return {
                    past: [],
                    present: currentLevel,
                    future: [],
                };
            }

            return {
                past: [...currentHistory.past, currentHistory.present],
                present: currentLevel,
                future: [],
            };
        });
    }, [currentLevel, history.present, isBoardSettled, pendingMatchedGemIds]);

    const loadPack = async (id: number) => {
        const levelPack = await loadLevelPack(id);
        const level = levelPack?.levels[0];
        if (!level || !levelPack) return;

        const { boardState, gemColorsById } = createInitialBoardState(level.board);
        const nextLevel = {
            id: 0,
            packName: levelPack.metadata.name,
            title: level.title,
            solution: level.solution ?? undefined,
            par: level.solution ? level.solution.length / 2 : undefined,
            moveCount: 0,
            initialBoardState: boardState.map((row) => [...row]),
            currentBoardState: boardState,
            gemColorsById,
        };

        // TODO: Porabably write some kind of level pack level parser

        clearTransientBoardState();
        setCurrentLevel(nextLevel);
        setHistory({
            past: [],
            present: nextLevel,
            future: [],
        });
    };

    const loadNextLevel = async () => {
        const currentLevel = history.present;
        if (!currentLevel) return;
        const { id } = currentLevel;
        // TODO: Get level pack ID from level pack state.
        // TODO: Explore storing entire level pack in state or something to avoid fetching.
        const levelPack = await loadLevelPack(0);
        const level = levelPack?.levels[id + 1];
        if (!level || !levelPack) return;

        const { boardState, gemColorsById } = createInitialBoardState(level.board);
        const nextLevel = {
            id: id + 1,
            packName: levelPack.metadata.name,
            title: level.title,
            solution: level.solution ?? undefined,
            par: level.solution ? level.solution.length / 2 : undefined,
            moveCount: 0,
            initialBoardState: boardState.map((row) => [...row]),
            currentBoardState: boardState,
            gemColorsById,
        };

        clearTransientBoardState();
        setCurrentLevel(nextLevel);
        setHistory({
            past: [],
            present: nextLevel,
            future: [],
        });
    };

    const value: GameStateContextValue = {
        currentLevel,
        hasOrphanedGems,
        isLevelCleared,
        loadPack,
        moveGem,
        undo,
        redo,
        canUndo,
        canRedo,
    };

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
