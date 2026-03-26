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
    edgeColor?: string
};

const Boundary: React.FC<BoundaryPieceProps> = ({
    w = 1,
    h = 1,
    edges = {},
    size = "100%",
    color = '#fbe9e9',
    edgeColor = '#dfbba8'
}) => {
    const width = w * 24;
    const height = h * 24;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}>
            <defs>
                <pattern id="boundary-dither" width="2" height="2" patternUnits="userSpaceOnUse">
                    <rect width="1" height="1" fill={edgeColor} />
                    <rect x="1" y="1" width="1" height="1" fill={edgeColor} />
                </pattern>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill={color} />
            {edges.top && <rect x="0" y="0" width={width} height="2" fill="url(#boundary-dither)" />}
            {edges.bottom && <rect x="0" y={height - 2} width={width} height="2" fill="url(#boundary-dither)" />}
            {edges.left && <rect x="0" y="0" width="2" height={height} fill="url(#boundary-dither)" />}
            {edges.right && <rect x={width - 2} y="0" width="2" height={height} fill="url(#boundary-dither)" />}
        </svg>
    );
};

export default Boundary;