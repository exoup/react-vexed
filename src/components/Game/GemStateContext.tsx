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
};

const GemStateContext = createContext<GemStateContextValue | null>(null);

export function GemStateProvider({ children }: PropsWithChildren) {
  const [slidingGemIds, setSlidingGemIds] = useState<Set<string>>(new Set());

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
  }), [slidingGemIds]);

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
