/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useState } from 'react';
import MarkSubTab from './MarkSubTab';
import ScaleSubTab from './ScaleSubTab';
import StyleSubTab from './StyleSubTab';

import theme from '../../../../theme';

import { useModelState, GraphSpec } from '../../../../hooks/bifrost-model';

export interface CustomizeSubTapProps {
  spec: GraphSpec;
  setSpec: (val: GraphSpec, options?: any) => void;
}

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
  Mark: MarkSubTab,
  Scale: ScaleSubTab,
  Style: StyleSubTab,
};

export default function CustomizationTab() {
  const subTabs = ['Mark', 'Scale', 'Style'];
  const [selectedTab, setSelectedTab] = useState<string>(subTabs[0]);
  const [graphSpec, setGraphSpec] = useModelState<GraphSpec>('graph_spec');
  const TabContents = subtabMapping[selectedTab];

  return (
    <div className="customize">
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
      <section>
        <TabContents spec={graphSpec} setSpec={setGraphSpec} />
      </section>
    </div>
  );
}
