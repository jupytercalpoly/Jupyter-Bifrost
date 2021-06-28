/** @jsx jsx */
import { jsx, css } from '@emotion/react';

// import Graph from './Graph';
import Sidebar from './Sidebar/Sidebar';
import { WidgetModel } from '@jupyter-widgets/base';
import { BifrostModelContext } from '../hooks/bifrost-model';
import { useState } from 'react';
import ChartChooser from './Onboarding/ChartChooser';
import ColumnScreen from './Onboarding/ColumnScreen';
import { VisualizationSpec } from 'react-vega';
import Graph from './Graph';

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
  const [screenName, setScreenName] = useState('columnChooser');
  const [selectedSpec, setSelectedSpec] = useState<VisualizationSpec>({});
  let Screen: JSX.Element;
  switch (screenName) {
    case 'columnChooser':
      Screen = <ColumnScreen onNext={() => setScreenName('chartChooser')} />;
      break;
    case 'chartChooser':
      Screen = (
        <ChartChooser
          onChartSelected={(data) => {
            setSelectedSpec(data);
            setScreenName('visualize');
          }}
          onBack={() => setScreenName('columnChooser')}
        />
      );
      break;
    case 'visualize':
      Screen = (
        <VisualizationScreen
          spec={selectedSpec}
          onPrevious={() => setScreenName('chartChooser')}
        />
      );
      break;

    default:
      Screen = (
        <VisualizationScreen
          spec={selectedSpec}
          onPrevious={() => setScreenName('chartChooser')}
        />
      );
      break;
  }
  return (
    <BifrostModelContext.Provider value={props.model}>
      {Screen}
    </BifrostModelContext.Provider>
  );
}

function VisualizationScreen({
  spec,
  onPrevious,
}: {
  spec: VisualizationSpec;
  onPrevious: () => void;
}) {
  return (
    <article className="BifrostWidget" css={bifrostWidgetCss}>
      <GridArea area="graph">
        <Graph spec={spec} onPrevious={onPrevious} />
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
