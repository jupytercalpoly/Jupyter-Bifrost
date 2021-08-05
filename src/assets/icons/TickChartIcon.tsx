import React from 'react';
import { BifrostIconProps } from './Icon';

export default function TickChartIcon(props: BifrostIconProps) {
  const color = props.color || '#6E7776';
  return (
    <svg
      width="23"
      height="6"
      viewBox="0 0 23 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 6V0.5M2.5 6V0.5M4 6V0.5M6 6V0.5M9 6V0.5M12.5 6V0.5M16.5 6V0.5M22 6V0.5"
        stroke={color}
      />
    </svg>
  );
}
