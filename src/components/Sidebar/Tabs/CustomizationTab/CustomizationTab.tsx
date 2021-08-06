/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useState } from 'react';
import ScaleSubTab from './ScaleSubTab';
import StyleSubTab from './StyleSubTab';

import theme from '../../../../theme';

import { useModelState, GraphSpec } from '../../../../hooks/bifrost-model';
import useSpecHistory from '../../../../hooks/useSpecHistory';

export interface CustomizeSubTapProps {
  spec: GraphSpec;
  setSpec: (val: GraphSpec, options?: any) => void;
}

const customizeCss = css`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  .customize-contents {
    height: 100%;
  }
`;
//TODO: factor out this css to global tab css
const subTabCss = css`
  ul {
    display: flex;
    justify-content: space-between;
    list-style: none;
    padding: 0;
    margin: 0;
    background: white;
    box-shadow: 0 4px 4px lightgrey;
  }
  li {
    padding: 15px 30px;
    cursor: pointer;
    border-bottom: none;

    &.selected {
      font-weight: 800;
      border-bottom: 2px solid ${theme.color.primary.dark};
    }
  }
`;

const subtabMapping: {
  [name: string]: (props: CustomizeSubTapProps) => jsx.JSX.Element;
} = {
  // Mark: MarkSubTab,
  Scale: ScaleSubTab,
  Style: StyleSubTab,
};

export default function CustomizationTab() {
  const subTabs = ['Mark', 'Scale', 'Style'];
  const [selectedTab, setSelectedTab] = useState<string>(subTabs[0]);
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const TabContents = subtabMapping[selectedTab];
  const saveSpec = useSpecHistory();

  function updateGraphSpec(spec: GraphSpec) {
    saveSpec(spec);
    setGraphSpec(spec);
  }

  return (
    <div className="customize" css={customizeCss}>
      <section className="subtab" css={subTabCss}>
        <ul>
          {subTabs.map((subtab) => {
            return (
              <li
                className={subtab === selectedTab ? 'selected' : ''}
                onClick={() => setSelectedTab(subtab)}
                key={subtab}
              >
                {subtab}
              </li>
            );
          })}
        </ul>
      </section>
      <div className="customize-contents">
        <TabContents spec={graphSpec} setSpec={updateGraphSpec} />
      </div>
    </div>
  );
}
