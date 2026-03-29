import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type GemStateContextValue = {
  slidingGemIds: Set<string>;
  startSliding: (gemId: string) => void;
  finishSliding: (gemId: string) => void;
  fallingGemIds: Set<string>;
  startFalling: (gemId: string) => void;
  finishFalling: (gemId: string) => void;
  clearingGemIds: Set<string>;
  startClearing: (gemId: string) => void;
  finishClearing: (gemId: string) => void;
  isInteractionLocked: boolean;
  isBoardSettled: boolean;
};

const GemStateContext = createContext<GemStateContextValue | null>(null);

export function GemStateProvider({ children }: PropsWithChildren) {
  const [slidingGemIds, setSlidingGemIds] = useState<Set<string>>(new Set());
  const [fallingGemIds, setFallingGemIds] = useState<Set<string>>(new Set());
  const [clearingGemIds, setClearingGemIds] = useState<Set<string>>(new Set());

  const value = useMemo<GemStateContextValue>(() => ({
    slidingGemIds,
    startSliding: (gemId: string) => {
      setSlidingGemIds((currentSet) => {
        const nextSet = new Set(currentSet);
        nextSet.add(gemId);
        return nextSet;
      });
    },
    finishSliding: (gemId: string) => {
      setSlidingGemIds((currentSet) => {
        if (!currentSet.has(gemId)) return currentSet;

        const nextSet = new Set(currentSet);
        nextSet.delete(gemId);
        return nextSet;
      });
    },
    fallingGemIds,
    startFalling: (gemId: string) => {
      setFallingGemIds((currentSet) => {
        const nextSet = new Set(currentSet);
        nextSet.add(gemId);
        return nextSet;
      });
    },
    finishFalling: (gemId: string) => {
      setFallingGemIds((currentSet) => {
        if (!currentSet.has(gemId)) return currentSet;

        const nextSet = new Set(currentSet);
        nextSet.delete(gemId);
        return nextSet;
      });
    },
    clearingGemIds,
    startClearing: (gemId: string) => {
      setClearingGemIds((currentSet) => {
        const nextSet = new Set(currentSet);
        nextSet.add(gemId);
        return nextSet;
      });
    },
    finishClearing: (gemId: string) => {
      setClearingGemIds((currentSet) => {
        if (!currentSet.has(gemId)) return currentSet;

        const nextSet = new Set(currentSet);
        nextSet.delete(gemId);
        return nextSet;
      });
    },
    isInteractionLocked: slidingGemIds.size > 0 || fallingGemIds.size > 0 || clearingGemIds.size > 0,
    isBoardSettled: slidingGemIds.size === 0 && fallingGemIds.size === 0 && clearingGemIds.size === 0
  }), [clearingGemIds, fallingGemIds, slidingGemIds]);

  return (
    <GemStateContext.Provider value={value}>
      {children}
    </GemStateContext.Provider>
  );
}

export function useGemState() {
  const context = useContext(GemStateContext);

  if (!context) {
    throw new Error("useGemState must be used within a GemStateProvider");
  }

  return context;
}
