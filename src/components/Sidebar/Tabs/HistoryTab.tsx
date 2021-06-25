import React from 'react';
import { useModelState } from '../../../hooks/bifrost-model';
export default function HistoryTab() {
  const opHistory = useModelState<string[]>('operation_history')[0];
  const setDfIndex = useModelState<number>('current_dataframe_index')[1];
  return (
    <section className="HistoryTab">
      <h1>History Tab</h1>
      <input
        type="range"
        min={1}
        max={opHistory.length + 1}
        onChange={(e) => setDfIndex(parseInt(e.target.value))}
      />
    </section>
  );
}
