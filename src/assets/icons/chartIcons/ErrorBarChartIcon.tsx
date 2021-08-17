import React from 'react';

export default function ErrorBarChartIcon({
  color = '#6E7776',
  width = 25,
  height = 25,
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
      <rect
        x="3.55319"
        y="16.3404"
        width="5.10638"
        height="6.12766"
        fill={color}
      />
      <rect
        x="10.7021"
        y="13.2766"
        width="5.10638"
        height="9.19149"
        fill={color}
      />
      <rect
        x="17.8511"
        y="10.2128"
        width="5.10638"
        height="12.2553"
        fill={color}
      />
      <path d="M1 0V24H25" stroke={color} />
      <path
        d="M6.10638 16.3404V13.2766M6.10638 13.2766H4.57447M6.10638 13.2766H7.6383"
        stroke={color}
      />
      <path
        d="M13.2553 13.2766V10.2128M13.2553 10.2128H11.7234M13.2553 10.2128H14.7872"
        stroke={color}
      />
      <path
        d="M20.4043 10.2128V7.14893M20.4043 7.14893H18.8723M20.4043 7.14893H21.9362"
        stroke={color}
      />
    </svg>
  );
}
