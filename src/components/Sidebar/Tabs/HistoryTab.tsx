/**@jsx jsx */
import { jsx } from '@emotion/react';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';

export default function HistoryTab() {
  const setSpec = useModelState<GraphSpec>('graph_spec')[1];
  const opHistory = useModelState<GraphSpec[]>('operation_history')[0];
  const [dfIndex, setDfIndex] = useModelState<number>(
    'current_dataframe_index'
  );

  function setHistoryPosition(index: number) {
    // debugger;
    setDfIndex(index);
    setSpec(opHistory[index]);
  }

  return (
    <section className="HistoryTab">
      <h1>History Tab</h1>
      <input
        type="range"
        value={dfIndex}
        min={0}
        max={opHistory.length - 1}
        onChange={(e) => setHistoryPosition(e.target.valueAsNumber)}
      />
    </section>
  );
}
