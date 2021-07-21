import { useEffect, useRef, useState } from 'react';
import { GraphSpec, useModelState } from './bifrost-model';

interface SpecHistoryOptions {
  saveOnDismount?: boolean;
}

/**
 * Keeps track of history and saves Graph Specs.
 * @param options Adaptations to how saving state should be handled
 * @returns a function that can manually save a graph spec to history
 */
export default function useSpecHistory(
  options: SpecHistoryOptions = { saveOnDismount: false }
) {
  const [opHistory, setOpHistory] = useModelState('spec_history');
  const graphSpec = useModelState('graph_spec')[0];
  const [index, setIndex] = useModelState('current_dataframe_index');
  const [originalSpec, setOriginalSpec] = useState(graphSpec);
  const hasChanged = originalSpec !== graphSpec;
  const saveRef = useRef<(spec?: GraphSpec) => void>(save);

  useEffect(() => {
    setOriginalSpec(graphSpec);
    return () => {
      options.saveOnDismount && saveRef.current();
    };
  }, []);

  /**
   * Saves graph spec to the current history branch
   * @param spec Graph Spec to save
   */
  function save(spec?: GraphSpec) {
    if (!hasChanged && !spec) {
      return;
    }
    const newHist = opHistory.slice(0, index + 1);
    newHist.push(spec || graphSpec);
    setOpHistory(newHist);
    setIndex(newHist.length - 1);
    setOriginalSpec(graphSpec);
  }

  saveRef.current = save;

  return save;
}
