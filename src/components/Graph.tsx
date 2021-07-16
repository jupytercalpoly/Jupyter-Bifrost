/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite } from 'react-vega';
import { useModelState } from '../hooks/bifrost-model';

export default function Graph() {
  const [selectedData, setSelectedData] = useModelState('selected_data');
  const spec = useModelState('graph_spec')[0];

  function handleBrush(...args: any) {
    console.log(args);
    setSelectedData(args);
  }

  console.log(selectedData);

  const data = useModelState('graph_data')[0];
  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div>
      <VegaLite
        spec={spec}
        data={graphData}
        signalListeners={signalListeners}
      />
    </div>
  );
}
