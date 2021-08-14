/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { BifrostTheme } from '../theme';

const loaderCss = (t: BifrostTheme) => css`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid ${t.color.primary.light};
  border-right: 4px solid transparent;
  animation: spin 1s infinite;

  @keyframes spin {
    from {
      transform: rotate(0turn);
    }
    to {
      transform: rotate(1turn);
    }
  }
`;

export default function Loader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="Loader" css={loaderCss} {...props}></div>;
}
