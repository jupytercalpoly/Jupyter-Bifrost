import React from 'react';

export default function PieChartIcon({
  color = '#6E7776',
  width = 26,
  height = 24,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={props.style}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.23288 5.53765C6.34487 6.39782 5.62074 7.45582 5.135 8.67949C3.3011 13.2994 5.55959 18.5312 10.1795 20.3651C14.7994 22.199 20.0312 19.9405 21.8651 15.3206C23.699 10.7007 21.4405 5.46892 16.8206 3.63502C15.7225 3.19912 14.5898 2.99442 13.4764 2.99769L13.5 12.0001L7.23288 5.53765Z"
        fill={color}
      />
      <path d="M1 0V23.5H24.5" stroke={color} />
    </svg>
  );
}
