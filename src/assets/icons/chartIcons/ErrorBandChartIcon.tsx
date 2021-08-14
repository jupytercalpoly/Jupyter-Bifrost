import React from 'react';

export default function ErrorBandChartIcon({
  color = '#6E7776',
  width = 24,
  height = 25,
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
      <path d="M0.5 0V24H24" stroke={color} />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24 14.808L15 19.2484L7.21995 15.2756L0.976143 20.7413L0.976136 16.8505L6.77996 11.6255L15 15.8229L24 11.2332L24 14.808Z"
        fill={color}
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24 9.1912L15 14.0221L7.06079 9.96807L1.00001 14.8082L0 14.2974L6.93912 8.76412L14.9999 12.8803L24 8.16992L24 9.1912Z"
        fill={color}
      />
    </svg>
  );
}
