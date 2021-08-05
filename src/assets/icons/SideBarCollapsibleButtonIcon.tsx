import React from 'react';

export default function SideBarCollapsibleButtonIcon({
  width = 55,
  height = 56,
  color = '#771C79',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.7759 11.0173C18.7771 12.75 19.8054 16.5875 18.0726 19.5887C16.3399 22.5899 12.5024 23.6181 9.50121 21.8854C6.50005 20.1527 5.47178 16.3151 7.2045 13.314C8.93722 10.3128 12.7748 9.28456 15.7759 11.0173Z"
        fill={color}
      />
      <circle
        cx="21.4462"
        cy="30.9299"
        r="6.27472"
        transform="rotate(-60 21.4462 30.9299)"
        fill={color}
      />
      <circle
        cx="30.8126"
        cy="16.4396"
        r="6.27472"
        transform="rotate(-60 30.8126 16.4396)"
        fill={color}
      />
    </svg>
  );
}
