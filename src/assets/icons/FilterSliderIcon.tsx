import React from 'react';

export default function FilterSliderIcon({
  color = 'rgba(0,0,0,0.4)',
  width = 13,
  height = 10,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="2.05263"
        cy="2.05263"
        r="1.55263"
        fill="#517242"
        stroke="#517242"
      />
      <circle
        cx="10.9474"
        cy="2.05263"
        r="1.55263"
        fill="#517242"
        stroke="#517242"
      />
      <path
        d="M1.02637 2.05273H12.6579"
        stroke="#517242"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </svg>
  );
}
