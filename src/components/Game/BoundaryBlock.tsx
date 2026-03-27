import React from "react";
import Boundary from "@/components/Blocks/Boundary";
import { blockSize } from "@/lib/constants";

export type BoundaryEdges = {
    top?: boolean,
    bottom?: boolean,
    left?: boolean,
    right?: boolean,
};

export type BoundaryLevelCell = boolean | number | string | null | undefined;
export type BoundaryLevelMap = BoundaryLevelCell[][];

export type BoundaryBlockProps = {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    edges?: BoundaryEdges,
    levelMap?: BoundaryLevelMap,
    size?: number | string
};

export const isGemCell = (cell: BoundaryLevelCell) => {
    return typeof cell === "number" && cell > 1;
};

export const isBoundaryCell = (cell: BoundaryLevelCell) => {
    return Boolean(cell) && !isGemCell(cell);
};

const hasBoundaryAt = (levelMap: BoundaryLevelMap, x: number, y: number) => {
    return isBoundaryCell(levelMap[y]?.[x]);
};

export const getBoundaryEdges = (
    levelMap: BoundaryLevelMap,
    x: number,
    y: number,
): BoundaryEdges => {
    return {
        top: !hasBoundaryAt(levelMap, x, y - 1),
        bottom: !hasBoundaryAt(levelMap, x, y + 1),
        left: !hasBoundaryAt(levelMap, x - 1, y),
        right: !hasBoundaryAt(levelMap, x + 1, y),
    };
};

export const BoundaryBlock: React.FC<BoundaryBlockProps> = ({
    x = 0,
    y = 0,
    w = 1,
    h = 1,
    edges,
    levelMap,
    size = blockSize,
}) => {
    const resolvedEdges = {
        top: true,
        bottom: true,
        left: true,
        right: true,
        ...(levelMap ? getBoundaryEdges(levelMap, x, y) : {}),
        ...(edges ?? {}),
    };

    return (
        <div
            className="absolute pointer-events-none overflow-hidden z-5"
            style={{ left: x * blockSize, top: y * blockSize, width: blockSize, height: blockSize }}
        >
            <Boundary size={size} w={w} h={h} edges={resolvedEdges} />
        </div>
    );
}

export default BoundaryBlock;
