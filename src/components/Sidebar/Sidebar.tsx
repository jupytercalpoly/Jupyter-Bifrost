/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, { useState } from 'react';
import VariablesTab from './Tabs/VariablesTab';
import HistoryTab from './Tabs/HistoryTab';
import CustomizationTab from './Tabs/CustomizationTab/CustomizationTab';
import { GraphSpec, useModelState } from '../../hooks/bifrost-model';
import VegaPandasTranslator from '../../modules/VegaPandasTranslator';
import { VegaEncoding } from '../../modules/VegaEncodings';
import produce from 'immer';

const sidebarCss = css`
  position: relative;
  display: flex;
  flex-direction: column;
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
    padding-bottom: 0;
    height: 100%;
  }
`;
const tabMapping: {
  [name: string]: (props: {
    clickedAxis: VegaEncoding | '';
    updateClickedAxis: (encoding: VegaEncoding | '') => void;
  }) => jsx.JSX.Element;
} = {
  Data: VariablesTab,
  Customization: CustomizationTab,
  History: HistoryTab,
};

export default function Sidebar(props: {
  graphRef: React.RefObject<HTMLDivElement>;
  clickedAxis: VegaEncoding | '';
  updateClickedAxis: (encoding: VegaEncoding | '') => void;
}) {
  const tabs = ['Data', 'Customization', 'History'];
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
        <TabContents
          clickedAxis={props.clickedAxis}
          updateClickedAxis={props.updateClickedAxis}
        />
      </div>
      <ActionBar />
    </aside>
  );
}

const tabBarCss = css`
  ul {
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
  const spec = useModelState('graph_spec')[0];
  const columnNameMap = useModelState('column_name_map')[0];
  const [dataframeName] = useModelState('df_variable_name');

  function exportCode() {
    // convert formatted columns to original
    const revertedSpec = produce(spec, (gs: GraphSpec) => {
      Object.keys(gs.encoding).forEach((channel) => {
        gs.encoding[channel as VegaEncoding].field =
          columnNameMap[gs.encoding[channel as VegaEncoding].field];
      });
      gs.transform.forEach((obj) =>
        obj['filter']['or'].forEach((el: any) => {
          el.field = columnNameMap[el.field];
        })
      );
    });

    const translator = new VegaPandasTranslator();
    const query = translator
      .convertSpecToCode(revertedSpec)
      .replace(/\$df/g, dataframeName || 'df');
    navigator.clipboard.writeText(query);
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
