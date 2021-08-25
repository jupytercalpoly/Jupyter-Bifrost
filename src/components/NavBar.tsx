/**@jsx jsx */

import { jsx, css } from '@emotion/react';
import { ArrowLeft, MoreHorizontal, HelpCircle } from 'react-feather';
import { useState } from 'react';
import HelpScreen from './HelpScreen/HelpScreen';
import MoreMenu from './ui-widgets/MoreMenu';
import { View } from 'vega';

const graphNavCss = css`
  .menu-list {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .menu-option {
    margin: 0 10px;
  }
`;

interface NavBarProps {
  onBack?(): void;
  onHelpRequested?(): void;
  onMoreClicked?(): void;
  vegaView?: View;
  selection: string;
  toggleSelection: () => void;
}

export default function NavBar(props: NavBarProps) {
  const [showHelpScreen, setShowHelpScreen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <nav className="graph-nav-bar" css={graphNavCss}>
      <ul className="menu-list">
        <li className="menu-option">
          <button className="wrapper" onClick={props.onBack}>
            <ArrowLeft />
          </button>
        </li>
        <li className="menu-option">
          <button className="wrapper" onClick={() => setShowHelpScreen(true)}>
            <HelpCircle />
          </button>
        </li>
        <li className="menu-option">
          <button className="wrapper" onClick={() => setShowMoreMenu(true)}>
            <MoreHorizontal />
          </button>
        </li>
        <li className="selection">
          <button className="wrapper" onClick={props.toggleSelection}>
            {props.selection}
          </button>
        </li>
      </ul>
      {showHelpScreen && (
        <HelpScreen onDismiss={() => setShowHelpScreen(false)} />
      )}
      {showMoreMenu && (
        <MoreMenu view={props.vegaView} onBack={() => setShowMoreMenu(false)} />
      )}
    </nav>
  );
}
