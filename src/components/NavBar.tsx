/**@jsx jsx */

import { jsx, css } from '@emotion/react';
import { ArrowLeft, Code, HelpCircle } from 'react-feather';

const graphNavCss = css`
  ul {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    margin: 0 10px;
  }
`;

interface NavBarProps {
  onBack?(): void;
  onHelpRequested?(): void;
  onExportCodeRequested?(): void;
}

export default function NavBar(props: NavBarProps) {
  return (
    <nav className="graph-nav-bar" css={graphNavCss}>
      <ul>
        <li>
          <button className="wrapper" onClick={props.onBack}>
            <ArrowLeft />
          </button>
        </li>
        <li>
          <button className="wrapper" onClick={props.onExportCodeRequested}>
            <Code />
          </button>
        </li>
        <li>
          <button className="wrapper" onClick={props.onHelpRequested}>
            <HelpCircle />
          </button>
        </li>
      </ul>
    </nav>
  );
}
