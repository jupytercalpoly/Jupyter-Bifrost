import React from 'react';
import { BifrostIconProps } from './Icon';

export default function LineChartIcon(props: BifrostIconProps) {
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
      <path d="M1 0V23.5H24.5" stroke={color} />
      <circle cx="4.5" cy="19" r="0.5" fill={color} stroke={color} />
      <path d="M4.5 19L8.5 11L16.5 10L21.5 4" stroke={color} />
      <circle cx="8.5" cy="11" r="0.5" fill={color} stroke={color} />
      <circle cx="21.5" cy="4" r="0.5" fill={color} stroke={color} />
      <circle cx="16.5" cy="10" r="0.5" fill={color} stroke={color} />
    </svg>
  );
}
