import React from 'react';

export type GemBlockProps = {
  /** Hex color for the base */
  color: string;
  /** Toggles the selection frame */
  isSelected?: boolean;
  /** 'left', 'right', or null to show directional arrow */
  dragDir?: 'left' | 'right' | null;
  /** Overall width and height (defaults to '100%') */
  size?: number | string;
} & React.HTMLAttributes<SVGElement>;

const Gem: React.FC<GemBlockProps> = ({
  color,
  isSelected = false,
  dragDir = null,
  size = "100%"
}) => {
  const framePath = (() => {
    let d = `M 0,-2 L 24,-2 A 2,2 0 0,1 26,0 `;
    if (dragDir === 'right') {
      d += `L 26,9 L 31,9 L 31,6 L 35,12 L 31,18 L 31,15 L 26,15 `;
    }
    d += `L 26,24 A 2,2 0 0,1 24,26 L 0,26 A 2,2 0 0,1 -2,24 `;
    if (dragDir === 'left') {
      d += `L -2,15 L -7,15 L -7,18 L -11,12 L -7,6 L -7,9 L -2,9 `;
    }
    d += `L -2,0 A 2,2 0 0,1 0,-2 Z`;
    return d;
  })();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        overflow: 'visible',
        imageRendering: 'pixelated'
      }}
    >
      <defs>
        <clipPath id="block-clip">
          <rect x="0" y="0" width="24" height="24" rx="2" />
        </clipPath>
        <clipPath id="frame-clip">
          <path d={framePath} />
        </clipPath>
        <pattern id="pat-w-50" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#ffffff" />
          <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
        </pattern>
        <pattern id="pat-b-50" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="#000000" />
          <rect x="1" y="1" width="1" height="1" fill="#000000" />
        </pattern>
      </defs>

      {/* Frame Layer and Arrows (Only visible when held/selected) */}
      {isSelected && (
        <g>
          {/* Silhouette for combined soft black outline (Outer Black) */}
          <path d={framePath} stroke="#000000" strokeWidth="2" strokeLinejoin="round" fill="#000000" />

          {/* White inner frame and arrows */}
          <path d={framePath} fill="#ffffff" stroke="#ffffff" strokeWidth="0.5" strokeLinejoin="round" />

          {/* INNER SHADOW */}
          <g clipPath="url(#frame-clip)">
            <path
              d={framePath}
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              transform="translate(-1, -1)"
              strokeLinejoin="round"
              opacity="0.2"
            />
          </g>

          {/* Inner black frame sandwich */}
          <rect x="-0.75" y="-0.75" width="25.5" height="25.5" rx="1.5" fill="#000000" />
        </g>
      )}

      {/* 3D Block Base Layer */}
      <g clipPath="url(#block-clip)" shapeRendering="crispEdges">
        {/* Base Color Fill */}
        <rect x="0" y="0" width="24" height="24" fill={color} />

        {/* Top Facet: Dithered Lightest (Solid 25% White + Dithered 40% White) */}
        <polygon points="0,0 24,0 17,7 7,7" fill="#ffffff" fillOpacity="0.25" />
        <polygon points="0,0 24,0 17,7 7,7" fill="url(#pat-w-50)" fillOpacity="0.4" />

        {/* Left Facet: Dithered Light */}
        <polygon points="0,0 7,7 7,17 0,24" fill="url(#pat-w-50)" fillOpacity="0.4" />

        {/* Right Facet: Dithered Dark */}
        <polygon points="24,0 24,24 17,17 17,7" fill="url(#pat-b-50)" fillOpacity="0.4" />

        {/* Bottom Facet: Dithered Darkest (Solid 25% Black + Dithered 40% Black) */}
        <polygon points="0,24 24,24 17,17 7,17" fill="#000000" fillOpacity="0.25" />
        <polygon points="0,24 24,24 17,17 7,17" fill="url(#pat-b-50)" fillOpacity="0.4" />

        {/* Center Pad Detailing */}
        <rect x="7" y="7" width="10" height="10" fill={color} />
        {/* Inner top/left highlight bevel */}
        <polyline points="7,17 7,7 17,7" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
        {/* Inner bottom/right shadow bevel */}
        <polyline points="17,7 17,17 7,17" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.5" />
      </g>

      {/* Soft inner outline matching the facet colors overlay */}
      <rect x="0.5" y="0.5" width="23" height="23" rx="1" fill="none" stroke="#000000" strokeWidth="1" strokeOpacity="0.25" />
    </svg>
  );
};

export default Gem;
