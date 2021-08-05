import React from 'react';

export default function SliderIcon({
  color = 'rgba(0,0,0,0.4)',
  width = 13,
  height = 10,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="5"
      viewBox="0 0 15 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="2.05263"
        cy="2.05263"
        r="1.55263"
        fill={color}
        stroke={color}
      />
      <circle
        cx="12.0526"
        cy="2.05263"
        r="1.55263"
        fill={color}
        stroke={color}
      />
      <path
        d="M1.02637 2.05273H12.6579"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
