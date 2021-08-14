import React from 'react';

export default function BoxPlotChartIcon({
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
      <path d="M1 0V23.5H25" stroke={color} />
      <path
        d="M21.9362 16.5L21.9362 12.5M21.9362 8.5L21.9362 12.5M21.9362 12.5L18.8723 12.5M18.8723 12.5L18.8723 9.5L7.6383 9.5L7.6383 12.5M18.8723 12.5L18.8723 15.5L7.6383 15.5L7.6383 12.5M7.6383 12.5L4.57447 12.5M4.57447 12.5L4.57447 8.5M4.57447 12.5L4.57447 16.5"
        stroke={color}
      />
      <path d="M12.7447 15L12.7447 10" stroke={color} />
      <rect
        x="12.7447"
        y="16"
        width="6"
        height="6.12766"
        transform="rotate(-90 12.7447 16)"
        fill={color}
      />
    </svg>
  );
}
