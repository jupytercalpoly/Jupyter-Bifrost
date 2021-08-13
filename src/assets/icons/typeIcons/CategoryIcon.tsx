import React from 'react';

export default function CategoryIcon({
  color = 'rgba(0,0,0,0.4)',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="6" height="6" rx="0.5" stroke={color} />
      <rect x="9" width="7" height="7" rx="1" fill={color} />
      <rect x="9.5" y="9.5" width="6" height="6" rx="0.5" stroke={color} />
      <rect x="0.5" y="9.5" width="6" height="6" rx="0.5" stroke={color} />
    </svg>
  );
}
