/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useEffect } from 'react';
import { VegaLite } from 'react-vega';
import { useModelState, GraphSpec } from '../hooks/bifrost-model';

export default function Graph() {
  function handleHover(...args: any) {
    console.log(args);
    console.log('hello');
  }

  const [{ spec, data }] = useModelState<GraphSpec>('graph_spec');
  const setDist = useModelState<number>('generate_random_dist')[1];

  // For testing purposes
  useEffect(() => {
    setDist(Date.now());
  }, []);

  const signalListeners = { brush: handleHover };

  return (
    <div>
      <VegaLite spec={spec} data={data} signalListeners={signalListeners} />
      <button onClick={() => setDist(Date.now())}>dist</button>
    </div>
  );
}
