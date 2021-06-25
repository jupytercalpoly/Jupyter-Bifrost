/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite } from 'react-vega';
import {
  useModelState,
  // useModelEvent,
  GraphSpec,
} from '../hooks/bifrost-model';

export default function Graph() {
  function handleHover(...args: any) {
    console.log(args);
    console.log('hello');
  }

  const state = useModelState<GraphSpec>('graph_spec', {
    data: {},
    spec: {},
  })[0];

  const setDist = useModelState<number>('generate_random_dist', 0)[1];

  const df_prop = useModelState<string[]>('df_prop', [])[0];

  const signalListners = { brush: handleHover };

  return (
    <div>
      <button onClick={() => setDist(Date.now())}>dist</button>
      <h1>{df_prop[0]}</h1>
      <VegaLite
        spec={state.spec}
        data={state.data}
        signalListeners={signalListners}
      />
    </div>
  );
}
