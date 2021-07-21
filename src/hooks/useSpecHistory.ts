import { GraphSpec, useModelState } from './bifrost-model';

export default function useSpecHistory() {
  const [opHistory, setOpHistory] = useModelState('spec_history');
  const graphSpec = useModelState('graph_spec')[0];
  const [index, setIndex] = useModelState('current_dataframe_index');

  /**
   * Saves graph spec to the current history branch
   * @param spec Graph Spec to save
   */
  function save(spec?: GraphSpec) {
    const newHist = opHistory.slice(0, index + 1);
    newHist.push(spec || graphSpec);
    setOpHistory(newHist);
    setIndex(newHist.length - 1);
  }

  return save;
}
