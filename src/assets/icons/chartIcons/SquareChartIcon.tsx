import React from 'react';

export default function SquareChartIcon({
  color = '#6E7776',
  width = 25,
  height = 24,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={props.style}
    >
      <g filter="url(#filter0_d)">
        <path d="M5 0V23.5H29" stroke={color} />
        <rect x="7.55319" y="18" width="3.06383" height="3" fill={color} />
        <rect x="16.7447" y="13" width="3.06383" height="3" fill={color} />
        <rect x="17.766" y="7" width="3.06383" height="3" fill={color} />
        <rect x="9.59575" y="7" width="3.06383" height="3" fill={color} />
        <rect x="23.8936" y="2" width="3.06383" height="3" fill={color} />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0.5"
          y="0"
          width={width}
          height={height}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
