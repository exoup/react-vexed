import { useId } from "react";

export type BoundaryPieceProps = {
    w?: number,
    h?: number,
    edges?: {
        top?: boolean,
        bottom?: boolean,
        left?: boolean,
        right?: boolean,
    },
    size?: number | string,
    color?: string,
    edgeColor?: string,
    highlightEdgeColor?: string,
};

const Boundary: React.FC<BoundaryPieceProps> = ({
    w = 1,
    h = 1,
    edges = {},
    size = "100%",
    color = '#fbe9e9',
    edgeColor = '#dfbba8',
    highlightEdgeColor = '#F8F8F8',
}) => {
    const width = w * 24;
    const height = h * 24;
    const patternIdPrefix = useId().replace(/:/g, "");
    const highlightPatternId = `${patternIdPrefix}-boundary-highlight-dither`;
    const shadowPatternId = `${patternIdPrefix}-boundary-shadow-dither`;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}>
            <defs>
                <pattern id={highlightPatternId} width="2" height="2" patternUnits="userSpaceOnUse">
                    <rect width="1" height="1" fill={highlightEdgeColor} />
                    <rect x="1" y="1" width="1" height="1" fill={highlightEdgeColor} />
                </pattern>
                <pattern id={shadowPatternId} width="2" height="2" patternUnits="userSpaceOnUse">
                    <rect width="1" height="1" fill={edgeColor} />
                    <rect x="1" y="1" width="1" height="1" fill={edgeColor} />
                </pattern>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill={color} />
            {edges.top && <rect x="0" y="0" width={width} height="2" fill={`url(#${highlightPatternId})`} />}
            {edges.bottom && <rect x="0" y={height - 2} width={width} height="2" fill={`url(#${shadowPatternId})`} />}
            {edges.left && <rect x="0" y="0" width="2" height={height} fill={`url(#${highlightPatternId})`} />}
            {edges.right && <rect x={width - 2} y="0" width="2" height={height} fill={`url(#${shadowPatternId})`} />}
        </svg>
    );
};

export default Boundary;
