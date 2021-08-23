/**@jsx jsx */

import { jsx, css } from '@emotion/react';
import { Fragment } from 'react';
import { BifrostTheme } from '../../theme';

const backdropCss = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const modalCss = (t: BifrostTheme) => css`
  border: 2px solid ${t.color.primary.light};
  border-radius: 5px;
  padding: 25px;
  background: white;
  z-index: 100;
  animation: enter 0.3s ease-out;
  position: absolute;

  @keyframes enter {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

type Position = [number | string, number | string];

interface ModalProps {
  position?: Position;
  onBack(): void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function Modal({
  position = [0, 0],
  onBack,
  style,
  children,
}: ModalProps) {
  return (
    <Fragment>
      <div className="backdrop" css={backdropCss} onClick={onBack}></div>
      <aside
        className="Modal"
        css={modalCss}
        style={{ ...style, top: position[1], left: position[0] }}
      >
        {children}
      </aside>
    </Fragment>
  );
}
