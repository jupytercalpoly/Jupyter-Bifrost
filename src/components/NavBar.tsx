/**@jsx jsx */

import { jsx, css } from '@emotion/react';
import { ArrowLeft } from 'react-feather';

const graphNavCss = css`
  ul {
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
      </ul>
    </nav>
  );
}
