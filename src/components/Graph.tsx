/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { useModelState, GraphData } from '../hooks/bifrost-model';
import NavHeader from './Onboarding/NavHeader';

interface GraphProps {
  spec: VisualizationSpec;
  onPrevious: () => void;
}
export default function Graph(props: GraphProps) {
  const [selectedData, setSelectedData] =
    useModelState<(string | {})[]>('selected_data');

  function handleBrush(...args: any) {
    console.log(args);
    setSelectedData(args);
  }

  console.log(selectedData);

  const data = useModelState<GraphData>('graph_data', (data) => ({ data }))[0];

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div>
      <NavHeader title="Chart" onPrevious={props.onPrevious} />
      <VegaLite
        spec={props.spec}
        data={data}
        signalListeners={signalListeners}
      />
    </div>
  );
}
