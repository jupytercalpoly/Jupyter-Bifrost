/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import Graph from './Graph';
import Sidebar from './Sidebar/Sidebar';
import { WidgetModel } from '@jupyter-widgets/base';
import { BifrostModelContext } from '../hooks/bifrost-model';
import { useState } from 'react';
import Onboarding from './Onboarding/Onboarding';

const bifrostWidgetCss = css`
  // Element-based styles
  //===========================================================
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-areas: 'graph sidebar';

  // Global styles for the widget
  //===========================================================
  button {
    cursor: pointer;
    transition: transform 0.4s;

    &:active {
      transform: scale(0.95);
    }
  }
`;

interface BifrostReactWidgetProps {
  model: WidgetModel;
}

export default function BifrostReactWidget(props: BifrostReactWidgetProps) {
  const isOnboarding = useState(true)[0];
  return (
    <BifrostModelContext.Provider value={props.model}>
      {isOnboarding ? <Onboarding /> : <VisualizationScreen />}
    </BifrostModelContext.Provider>
  );
}

function VisualizationScreen() {
  return (
    <article className="BifrostWidget" css={bifrostWidgetCss}>
      <GridArea area="graph">
        <Graph />
      </GridArea>
      <GridArea area="sidebar">
        <Sidebar />
      </GridArea>
    </article>
  );
}

function GridArea(props: { area: string; children: any }) {
  return <div style={{ gridArea: props.area }}>{props.children}</div>;
}
