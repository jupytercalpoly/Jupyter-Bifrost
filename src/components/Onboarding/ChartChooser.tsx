/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { PlainObject, VegaLite, VisualizationSpec } from 'react-vega';
import {
  useModelState,
  SuggestedGraphs,
  GraphSpec,
} from '../../hooks/bifrost-model';
import NavHeader from './NavHeader';

const suggestedChartCss = (theme: any) => css`
  padding: 20px;
  display: flex;
  overflow: scroll;

  .graph-wrapper {
    padding: 10px;
    margin: 0 10px;
    border: 3px solid transparent;
    border-radius: 5px;
    transition: border-color 0.5s;
    &.selected {
      border-color: ${theme.color.primary[1]};
    }
  }
`;

interface ChartChooserProps {
  onBack?: () => void;
  onChartSelected: (spec: VisualizationSpec) => void;
}

export default function ChartChooser(props: ChartChooserProps) {
  const suggestedGraphs = useModelState<SuggestedGraphs>('suggested_graphs')[0];
  const data = useModelState<PlainObject>('graph_data', (data) => ({
    data,
  }))[0];
  const setGraphSpec = useModelState<GraphSpec>('graph_spec')[1];
  const setOpHistory = useModelState<GraphSpec[]>('spec_history')[1];
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const keyPressed = { Shift: false, Enter: false };

  function displayChart() {
    if (selectedIndex === -1) {
      return;
    }

    const spec = suggestedGraphs[selectedIndex] as GraphSpec;
    setGraphSpec(spec);
    setOpHistory([spec]);
    props.onChartSelected(spec);
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLElement>) {
    switch (e.key) {
      case 'Shift':
        keyPressed['Shift'] = false;
        keyPressed['Enter'] = false;
        break;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        if (keyPressed['Shift']) {
          e.preventDefault();
          e.stopPropagation();
          keyPressed['Enter'] = true;
          displayChart();
        }
        break;

      case 'Shift':
        e.preventDefault();
        e.stopPropagation();
        keyPressed['Shift'] = true;
        break;
    }
  }

  return (
    <section
      className="ChartChooser"
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
    >
      <NavHeader
        title="Select Chart"
        onNext={displayChart}
        onPrevious={props.onBack}
      />
      <div className="suggestedCharts" css={suggestedChartCss}>
        {suggestedGraphs.map((spec, i) => (
          <div
            className={
              selectedIndex === i ? 'graph-wrapper selected' : 'graph-wrapper'
            }
            key={`spec_${i}`}
            onClick={() => setSelectedIndex(i)}
          >
            <VegaLite spec={spec as VisualizationSpec} data={data} />
          </div>
        ))}
      </div>
    </section>
  );
}
