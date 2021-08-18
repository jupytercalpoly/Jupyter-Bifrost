/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { BifrostTheme } from '../theme';

interface TooltipProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

const tooltipCss = (t: BifrostTheme) => css`
  position: relative;

  &:hover > .tooltip {
    display: block;
  }
  .tooltip {
    display: none;
    position: absolute;
    padding: 3px;
    border: 1px solid #e4d2e4;
    background: white;
    font-size: 12px;
    &.top {
      bottom: 100%;
      left: 0;
    }
    &.bottom {
      top: 100%;
      left: 0;
    }
    &.left {
      bottom: 50%;
      right: 100%;
      transform: translateY(50%);
    }
    &.right {
      bottom: 50%;
      left: 100%;
      transform: translateY(50%);
    }
  }
`;

export default function Tooltip({
  message,
  children,
  position = 'top',
}: TooltipProps) {
  return (
    <div css={tooltipCss}>
      {children}
      <div className={`tooltip ${position}`}>{message}</div>
    </div>
  );
}
