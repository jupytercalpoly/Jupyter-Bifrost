/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useEffect } from 'react';
import { VegaLite } from 'react-vega';
import { useModelState, GraphSpec } from '../hooks/bifrost-model';

export default function Graph() {
  const [selectedData, setSelectedData] =
    useModelState<(string | {})[]>('selected_data');

  function handleBrush(...args: any) {
    setSelectedData(args);
  }

  console.log(selectedData);

  const [{ spec, data }] = useModelState<GraphSpec>('graph_spec');
  const setDist = useModelState<number>('generate_random_dist')[1];

  // For testing purposes
  useEffect(() => {
    setDist(Date.now());
  }, []);

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div>
      <VegaLite spec={spec} data={data} signalListeners={signalListeners} />
      <button onClick={() => setDist(Date.now())}>dist</button>
    </div>
  );
}
