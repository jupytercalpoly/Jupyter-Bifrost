/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import {
  useModelState,
  GraphData,
  SuggestedGraphs,
} from '../../hooks/bifrost-model';
import NavHeader from './NavHeader';

const suggestedChartCss = css`
  padding: 20px;
  display: flex;
  overflow: scroll;

  .graph-wrapper {
    padding: 10px;
    margin: 0 10px;
    &.selected {
      border: 2px solid blue;
    }
  }
`;

interface ChartChooserProps {
  onBack: () => void;
  onChartSelected: (spec: VisualizationSpec) => void;
}

export default function ChartChooser(props: ChartChooserProps) {
  const suggestedGraphs = useModelState<SuggestedGraphs>('suggested_graphs')[0];
  const data = useModelState<GraphData>('graph_data', (data) => ({ data }))[0];
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  function displayChart() {
    if (selectedIndex === -1) {
      return;
    }
    const spec = suggestedGraphs[selectedIndex] as VisualizationSpec;
    props.onChartSelected(spec);
  }

  return (
    <section className="ChartChooser">
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
            onClick={() => setSelectedIndex(i)}
          >
            <VegaLite spec={spec as VisualizationSpec} data={data} />
          </div>
        ))}
      </div>
    </section>
  );
}
