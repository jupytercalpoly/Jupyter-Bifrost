/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite } from 'react-vega';
import {useModelState, useModelEvent, GraphSpec} from"../hooks/bifrost-model"


export default function Graph() {
  function handleHover(e: any) {
    console.log(e);
  }

  const [{spec, data}] = useModelState<GraphSpec>("graph_spec", {data:{}, spec:{}})
  const setDist = useModelState<number>("generate_random_dist", 0)[1]

  const signalListeners = { cursor: handleHover };

  return (
    <div>
      <VegaLite
      spec={spec}
      data={data}
      signalListeners={signalListeners}
    />
    <button onClick={() => setDist(Date.now())}>dist</button>
    </div>
    
  );
}
