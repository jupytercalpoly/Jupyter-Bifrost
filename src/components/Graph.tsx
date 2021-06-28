/** @jsx jsx */
import { jsx } from '@emotion/react';
import { ArrowLeft } from 'react-feather';
import { VegaLite } from 'react-vega';
import { useModelState, GraphData, GraphSpec } from '../hooks/bifrost-model';

interface GraphProps {
  onBack: () => void;
}
export default function Graph(props: GraphProps) {
  const [selectedData, setSelectedData] = useModelState<any[]>('selected_data');
  const spec = useModelState<GraphSpec>('graph_spec')[0];

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
      <button className="wrapper" onClick={props.onBack}>
        <ArrowLeft />
      </button>
      <VegaLite spec={spec} data={data} signalListeners={signalListeners} />
    </div>
  );
}
