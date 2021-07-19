/** @jsx jsx */
import { jsx } from '@emotion/react';
import { useCallback } from 'react';
import { VegaLite } from 'react-vega';
import { debounce } from 'debounce';
import { useModelState } from '../hooks/bifrost-model';

const brushDelay = 300;

export default function Graph() {
  const setSelectedData = useModelState('selected_data')[1];
  const selectDataDebounced = useCallback(
    debounce(setSelectedData, brushDelay),
    [setSelectedData]
  );
  const spec = useModelState('graph_spec')[0];

  function handleBrush(...args: any) {
    selectDataDebounced(args);
  }

  const data = useModelState('graph_data')[0];
  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <VegaLite spec={spec} data={graphData} signalListeners={signalListeners} />
  );
}
