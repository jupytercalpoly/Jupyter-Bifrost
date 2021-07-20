/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useState } from 'react';
import VariablesTab from './Tabs/VariablesTab';
import HistoryTab from './Tabs/HistoryTab';
import CustomizationTab from './Tabs/CustomizationTab/CustomizationTab';
import { useModelState } from '../../hooks/bifrost-model';
import VegaPandasTranslator from '../../modules/VegaPandasTranslator';

const sidebarCss = css`
  width: 100%;
  max-width: 600px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-content {
    border: 2px solid #e4e4e4;
    border-top: none;
    border-bottom: none;
    padding: 10px;
    overflow: auto;
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
      <ActionBar />
    </aside>
  );
}

const tabBarCss = css`
  ul {
    position: sticky;
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: space-between;
  }
  li {
    padding: 15px 30px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background: #e9e9e9;
    cursor: pointer;

    border: 1px solid #d4d4d4;
    border-bottom: none;
    width: calc(100% / 3);
    text-align: center;
    overflow-x: auto;

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

const actionBarCss = css`
  ul {
    display: flex;
    justify-content: center;
    border: 2px solid #e4e4e4;
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
  const [opHistory, setOpHistory] = useModelState('spec_history');
  const spec = useModelState('graph_spec')[0];
  const [index, setIndex] = useModelState('current_dataframe_index');
  const [dataframeName] = useModelState('df_variable_name');

  function exportCode() {
    const translator = new VegaPandasTranslator();
    const query = translator
      .convertSpecToCode(spec)
      .replace(/\$df/g, dataframeName || 'df');
    navigator.clipboard.writeText(query);
  }

  function applyGraphChanges() {
    const newHist = opHistory.slice(0, index + 1);
    newHist.push(spec);
    setOpHistory(newHist);
    setIndex(newHist.length - 1);
  }

  return (
    <nav className="action-bar" css={actionBarCss}>
      <ul>
        <li>
          <button onClick={applyGraphChanges}>Apply Changes</button>
        </li>
        <li>
          <button onClick={exportCode}>Export Code</button>
        </li>
      </ul>
    </nav>
  );
}
