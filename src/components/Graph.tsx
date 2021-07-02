/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite } from 'react-vega';
import { useModelState, GraphData, GraphSpec } from '../hooks/bifrost-model';

interface GraphProps {
  onBack?: () => void;
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

  let back_button: JSX.Element | null = null;
  if (props.onBack) {
    back_button = (
      <button className="wrapper" onClick={props.onBack}>
        <ArrowLeft />
      </button>
    );
  }
  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div>
      {back_button}
      <VegaLite spec={spec} data={data} signalListeners={signalListeners} />
    </div>
  );
}
