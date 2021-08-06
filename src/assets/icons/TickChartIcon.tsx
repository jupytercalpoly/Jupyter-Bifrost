import React from 'react';
import { BifrostIconProps } from './Icon';

export default function TickChartIcon(props: BifrostIconProps) {
  const color = props.color || '#6E7776';
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 0V23.5H24.5" stroke={color} />
      <path
        d="M2.5 22V16.5M4 22V16.5M5.5 22V16.5M7.5 22V16.5M10.5 22V16.5M14 22V16.5M18 22V16.5M23.5 22V16.5"
        stroke={color}
      />
    </svg>
  );
}
