/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, { useState } from 'react';
import EditTab from './Tabs/EditTab';
import HistoryTab from './Tabs/HistoryTab';
import NearbyTab from './Tabs/NearbyTab';
import { useModelState } from '../../hooks/bifrost-model';
import { VegaEncoding } from '../../modules/VegaEncodings';
import { CSSTransitionGroup } from 'react-transition-group';
import theme, { BifrostTheme } from '../../theme';

const transitionCss = css`
  .side-bar-transition-enter {
    opacity: 0.01;
    &.side-bar-transition-enter-active {
      opacity: 1;
      transition: opacity 500ms ease-in;
    }
  }

  .side-bar-transition-leave {
    opacity: 1;
    &.side-bar-transition-leave-active {
      opacity: 0.01;
      transition: opacity 300ms ease-in;
    }
  }
  .side-bar-transition-appear {
    opacity: 0.01;
    &.side-bar-transition-appear-active {
      opacity: 1;
      transition: opacity 0.5s ease-in;
    }
  }
`;

const sidebarCss = css`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  height: 100%;
  min-height: 400px;
  border-radius: 2.5% 2.5% 0 0;
  box-shadow: ${theme.shadow.handle};
  margin: 8px;

  .sidebar-content {
    position: relative;
    border-top: 2px solid #e4e4e4;
    padding: 10px;
    padding-bottom: 0;
    height: 430px;
  }
`;
const tabMapping: {
  [name: string]: (props: {
    clickedAxis: VegaEncoding | '';
    updateClickedAxis: (encoding: VegaEncoding | '') => void;
  }) => jsx.JSX.Element;
} = {
  Edit: EditTab,
  History: HistoryTab,
  Nearby: NearbyTab,
};

export default function Sidebar(props: {
  graphRef: React.RefObject<HTMLDivElement>;
  clickedAxis: VegaEncoding | '';
  updateClickedAxis: (encoding: VegaEncoding | '') => void;
}) {
  const tabs = ['Edit', 'History', 'Nearby'];
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const TabContents = tabMapping[selectedTab];
  return (
    <CSSTransitionGroup
      transitionName="side-bar-transition"
      transitionAppear={true}
      transitionAppearTimeout={500}
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}
      css={transitionCss}
    >
      <aside css={sidebarCss}>
        <TabBar
          tabs={tabs}
          onTabSelected={setSelectedTab}
          activeTab={selectedTab}
        />
        <div className="sidebar-content">
          <TabContents
            clickedAxis={props.clickedAxis}
            updateClickedAxis={props.updateClickedAxis}
          />
        </div>
        <ActionBar />
      </aside>
    </CSSTransitionGroup>
  );
}

const tabBarCss = (t: BifrostTheme) => css`
  ul {
    display: flex;
    justify-content: space-around;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    padding: 8px 30px;
  }
  li {
    background: transparent;
    cursor: pointer;
    border-bottom: none;
    transform: scale(1);
    transition: transform 0.5s;
    padding: 5px 20px;
    border-radius: 7px;

    &:active {
      transform: scale(0.95);
    }

    &.selected {
      font-weight: 800;
      background-color: ${t.color.primary.dark};
      color: white;
    }
  }
`;
interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabSelected: (name: string) => void;
}

function TabBar(props: TabBarProps) {
  return (
    <nav className="TabBar" css={tabBarCss}>
      <ul>
        {props.tabs.map((tab) => (
          <li
            className={props.activeTab === tab ? 'selected' : ''}
            onClick={() => props.onTabSelected(tab)}
            key={tab}
          >
            {tab}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const actionBarCss = css`
  ul {
    display: flex;
    justify-content: center;
    border-top: none;
    list-style: none;
    margin: 0;
    padding: 12px;
    box-shadow: 0 0 20px #00000017;
  }
  li {
    margin: 0 10px;
  }
`;

function ActionBar() {
  const dfCode = useModelState('df_code')[0];

  function exportCode() {
    navigator.clipboard.writeText(dfCode);
  }

  return (
    <nav className="action-bar" css={actionBarCss}>
      <ul>
        <li>
          <button onClick={exportCode}>Export Code</button>
        </li>
      </ul>
    </nav>
  );
}
