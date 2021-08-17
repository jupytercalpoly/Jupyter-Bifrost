import React from 'react';

export default function BarChartIcon({
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
      <rect x="4" y="13.5" width="4" height="8" fill={color} stroke={color} />
      <rect x="11" y="8.5" width="4" height="13" fill={color} stroke={color} />
      <rect x="18" y="3.5" width="4" height="18" fill={color} stroke={color} />
      <path d="M1 0V23.5H24.5" stroke={color} />
    </svg>
  );
}
