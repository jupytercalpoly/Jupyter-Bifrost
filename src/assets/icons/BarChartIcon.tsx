import React from 'react';
import { BifrostIconProps } from './Icon';

export default function BarChartIcon(props: BifrostIconProps) {
  const color = props.color || '#6E7776';
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
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
