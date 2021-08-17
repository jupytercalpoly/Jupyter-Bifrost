import React from 'react';

export default function CircleChartIcon({
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
      <ellipse cx="4.57447" cy="19" rx="1.02128" ry="1" fill={color} />
      <ellipse cx="7.6383" cy="9" rx="1.02128" ry="1" fill={color} />
      <ellipse cx="14.7872" cy="15" rx="1.02128" ry="1" fill={color} />
      <ellipse cx="21.9362" cy="4" rx="1.02128" ry="1" fill={color} />
      <ellipse cx="15.8085" cy="9" rx="1.02128" ry="1" fill={color} />
    </svg>
  );
}
