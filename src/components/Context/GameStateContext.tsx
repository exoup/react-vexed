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

type GameStateContextValue = {
    currentLevel: LevelState | null;
    hasOrphanedGems: boolean;
    isLevelCleared: boolean;
    // actions
    loadPack: (id: number) => Promise<void>;
    moveGem: (gemId: string, direction: BoardDirection) => void;
};

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function GameStateProvider({ children }: PropsWithChildren) {
    const [currentLevel, setCurrentLevel] = useState<LevelState | null>(null);
    const [pendingMatchedGemIds, setPendingMatchedGemIds] = useState<Set<string>>(new Set());

    const {
        clearingGemIds,
        fallingGemIds,
        isBoardSettled,
        slidingGemIds,
        startClearing,
        startFalling,
        startSliding,
    } = useGemState();

    const moveGem = (gemId: string, direction: BoardDirection) => {
        if (!currentLevel) return;

        const nextBoardState = moveGemInBoard(currentLevel.currentBoardState, gemId, direction);

        if (!nextBoardState) return;

        startSliding(gemId);
        setCurrentLevel((prevLevel) => {
            if (!prevLevel) return prevLevel;

            return {
                ...prevLevel,
                currentBoardState: nextBoardState,
            };
        });
    };

    useEffect(() => {
        if (!currentLevel) return;
        if (slidingGemIds.size > 0) return;
        if (fallingGemIds.size > 0) return;

        if (pendingMatchedGemIds.size > 0) {
            if (clearingGemIds.size > 0) return;

            setCurrentLevel((prevLevel) => {
                if (!prevLevel) return prevLevel;

                return {
                    ...prevLevel,
                    currentBoardState: removeMatchedGems(prevLevel.currentBoardState, pendingMatchedGemIds),
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

            setCurrentLevel((prevLevel) => {
                if (!prevLevel) return prevLevel;

                return {
                    ...prevLevel,
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

    const loadPack = async (id: number) => {
        const levelPack = await loadLevelPack(id);
        const level = levelPack?.levels[50];
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
        setPendingMatchedGemIds(new Set());
    };

    const value: GameStateContextValue = {
        currentLevel,
        hasOrphanedGems,
        isLevelCleared,
        loadPack,
        moveGem,
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
