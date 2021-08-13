import React from 'react';

export default function ScatterChartIcon({
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
      <path d="M1 0V23.5H24.5" stroke={color} />
      <circle cx="17.5" cy="9" r="0.5" fill={color} stroke={color} />
      <circle cx="15.5" cy="16" r="2.5" stroke={color} />
      <circle cx="8" cy="7.5" r="2" stroke={color} />
      <circle cx="19" cy="2.5" r="1" stroke={color} />
      <circle cx="5" cy="17.5" r="1" stroke={color} />
    </svg>
  );
}
