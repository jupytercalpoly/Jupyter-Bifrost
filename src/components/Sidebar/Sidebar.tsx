/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useState } from 'react';
import VariablesTab from './Tabs/VariablesTab';
import HistoryTab from './Tabs/HistoryTab';
import CustomizationTab from './Tabs/CustomizationTab';

const sidebarCss = css`
  width: 100%;
  height: 100%;

  .sidebar-content {
    border: 2px solid #e4e4e4;
    border-top: none;
    padding: 10px;
  }
`;
const tabMapping: { [name: string]: () => jsx.JSX.Element } = {
  Variables: VariablesTab,
  Customization: CustomizationTab,
  History: HistoryTab,
};

export default function Sidebar() {
  const tabs = ['Variables', 'Customization', 'History'];
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const TabContents = tabMapping[selectedTab];
  return (
    <aside css={sidebarCss}>
      <TabBar
        tabs={tabs}
        onTabSelected={setSelectedTab}
        activeTab={selectedTab}
      />
      <div className="sidebar-content">
        <TabContents />
      </div>
    </aside>
  );
}

const tabBarCss = css`
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 15px 30px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background: #e9e9e9;
    cursor: pointer;

    border: 1px solid #d4d4d4;
    border-bottom: none;

    &.selected {
      font-weight: 800;
      background: whitesmoke;
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
