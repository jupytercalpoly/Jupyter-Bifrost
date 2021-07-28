import React from 'react';

export default function FilterIcon({
  color,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.3333 1H1L6.33333 7.30667V11.6667L9 13V7.30667L14.3333 1Z"
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
