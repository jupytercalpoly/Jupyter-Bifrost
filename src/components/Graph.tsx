/** @jsx jsx */
import { jsx } from '@emotion/react';
import { PlainObject, VegaLite } from 'react-vega';
import { useModelState } from '../hooks/bifrost-model';

export default function Graph() {
  const [selectedData, setSelectedData] = useModelState('selected_data');
  const spec = useModelState('graph_spec')[0];

  function handleBrush(...args: any) {
    console.log(args);
    setSelectedData(args);
  }

  console.log(selectedData);

  const data = useModelState('graph_data', (data) => ({ data }))[0];

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div>
      <VegaLite
        spec={spec}
        data={data as unknown as PlainObject}
        signalListeners={signalListeners}
      />
    </div>
  );
}
