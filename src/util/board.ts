export type BoardDirection = "left" | "right";
export type BoardCell = 0 | 1 | string;
export type BoardState = BoardCell[][];
type GemPosition = { x: number; y: number };

export const createGemId = (cell: number, x: number, y: number) => {
  return `gem-${cell}-${x}-${y}`;
};

export const getGemType = (gemId: string) => {
  return gemId.split("-")[1] ?? "";
};

export const isGemCell = (cell: BoardCell): cell is string => {
  return typeof cell === "string";
};

export const createInitialBoardState = (map: number[][], gemColors: string[]) => {
  const gemColorsById: Record<string, string> = {};

  const boardState: BoardState = map.map((row, y) =>
    row.map((cell, x) => {
      if (cell <= 1) return cell as 0 | 1;

      const gemId = createGemId(cell, x, y);
      gemColorsById[gemId] = gemColors[cell - 2] ?? gemColors[0]!;
      return gemId;
    }),
  );

  return { boardState, gemColorsById };
};

const cloneBoardState = (boardState: BoardState) => {
  return boardState.map((row) => [...row]);
};

const findGemPosition = (boardState: BoardState, gemId: string): GemPosition | null => {
  for (let y = 0; y < boardState.length; y += 1) {
    const x = boardState[y]!.findIndex((cell) => cell === gemId);

    if (x !== -1) {
      return { x, y };
    }
  }

  return null;
};

export const moveGemInBoard = (boardState: BoardState, gemId: string, direction: BoardDirection) => {
  const gemPosition = findGemPosition(boardState, gemId);

  if (!gemPosition) return null;

  const { x: currentX, y: currentY } = gemPosition;
  const targetX = currentX + (direction === "left" ? -1 : 1);
  const targetCell = boardState[currentY]?.[targetX];

  if (targetCell !== 0) return null;

  return boardState.map((row, y) => {
    if (y !== currentY) return row;

    return row.map((cell, x) => {
      if (x === currentX) return 0;
      if (x === targetX) return gemId;
      return cell;
    });
  });
};

export const applyGravity = (boardState: BoardState, blockedGemIds: Set<string>) => {
  const nextBoardState = cloneBoardState(boardState);
  let hasAnyFallingGem = false;
  const fallingGemIds = new Set<string>();

  for (let x = 0; x < nextBoardState[0]!.length; x += 1) {
    for (let y = nextBoardState.length - 2; y >= 0; y -= 1) {
      const currentCell = nextBoardState[y]![x]!;
      if (!isGemCell(currentCell)) continue;
      if (blockedGemIds.has(currentCell)) continue;

      let targetY = y;

      while (nextBoardState[targetY + 1]?.[x] === 0) {
        targetY += 1;
      }

      if (targetY === y) continue;

      nextBoardState[y]![x] = 0;
      nextBoardState[targetY]![x] = currentCell;
      hasAnyFallingGem = true;
      fallingGemIds.add(currentCell);
    }
  }

  return { boardState: nextBoardState, hasChanged: hasAnyFallingGem, fallingGemIds };
};

export const findMatches = (boardState: BoardState) => {
  const matchedGemIds = new Set<string>();
  const visitedGemIds = new Set<string>();
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  for (let y = 0; y < boardState.length; y += 1) {
    for (let x = 0; x < boardState[y]!.length; x += 1) {
      const currentCell = boardState[y]![x]!;
      if (!isGemCell(currentCell)) continue;
      if (visitedGemIds.has(currentCell)) continue;

      const gemType = getGemType(currentCell);
      const connectedGemIds = new Set<string>();
      const queue = [{ x, y }];

      while (queue.length > 0) {
        const nextPosition = queue.shift()!;
        const nextCell = boardState[nextPosition.y]?.[nextPosition.x];
        if (!nextCell) continue;
        if (!isGemCell(nextCell)) continue;
        if (visitedGemIds.has(nextCell)) continue;
        if (getGemType(nextCell) !== gemType) continue;

        visitedGemIds.add(nextCell);
        connectedGemIds.add(nextCell);

        directions.forEach((direction) => {
          queue.push({
            x: nextPosition.x + direction.x,
            y: nextPosition.y + direction.y,
          });
        });
      }

      if (connectedGemIds.size < 2) continue;

      connectedGemIds.forEach((gemId) => {
        matchedGemIds.add(gemId);
      });
    }
  }

  return matchedGemIds;
};

export const removeMatchedGems = (boardState: BoardState, matchedGemIds: Set<string>) => {
  if (matchedGemIds.size === 0) return boardState;

  return boardState.map((row) =>
    row.map((cell) => (isGemCell(cell) && matchedGemIds.has(cell) ? 0 : cell)),
  );
};

export const hasEmpty = (boardState: BoardState) => {
  return boardState.every((row) => row.every((cell) => cell === 0 || cell === 1));
};

export const hasOrphans = (boardState: BoardState) => {
  const gemTypeCounts = new Map<string, number>();

  boardState.forEach((row) => {
    row.forEach((cell) => {
      if (isGemCell(cell)) {
        const gemType = getGemType(cell);
        gemTypeCounts.set(gemType, (gemTypeCounts.get(gemType) ?? 0) + 1);
      }
    });
  });

  return [...gemTypeCounts.values()].some((count) => count === 1);
};
