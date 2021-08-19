import React from 'react';

export default function ScaleIcon({
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
        d="M7.35254 1H9.99957V3.64703"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M1 9.99991L9.99991 1"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M9.99957 7.88086V10.5279H7.35254"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M6.82324 7.35352L9.99968 10.53"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
      <path
        d="M1 1.5293L3.64703 4.17633"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </svg>
  );
}
