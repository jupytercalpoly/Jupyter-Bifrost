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
      <path
        d="M0.999998 3.33398L6.44444 3.33398"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M9.55566 3.33398L15.0001 3.33398"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M6.44444 1L6.44444 5.66667"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </svg>
  );
}
