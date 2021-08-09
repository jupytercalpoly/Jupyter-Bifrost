import produce from 'immer';
import { useEffect, useRef, useState } from 'react';
import VegaPandasTranslator from '../modules/VegaPandasTranslator';
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
  const setDfCode = useModelState('df_code')[1];
  const [columnMap] = useModelState('column_name_map');
  const [outputVar] = useModelState('output_variable');
  const [originalSpec, setOriginalSpec] = useState(graphSpec);
  const saveRef = useRef<(spec?: GraphSpec) => void>(save);

  useEffect(() => {
    setOriginalSpec(graphSpec);
    return () => {
      //Slightly delay the dismount save so that new component's event listeners
      // have time to initialize and receive the update (prevents race condition).
      setTimeout(() => {
        options.saveOnDismount && saveRef.current();
      }, 100);
    };
  }, []);

  /**
   * Saves graph spec to the current history branch
   * @param spec Graph Spec to save
   */
  function save(spec: GraphSpec = graphSpec) {
    const hasChanged = originalSpec !== spec;
    const hasNoEncoding = !Object.keys(spec.encoding).length;
    if (!hasChanged || hasNoEncoding) {
      return;
    }
    const newHist = opHistory.slice(0, index + 1);
    newHist.push(spec);
    setOpHistory(newHist);
    setIndex(newHist.length - 1);
    setOriginalSpec(spec);
    setDfCode(updateDfCode(outputVar, spec, columnMap));
  }

  saveRef.current = save;

  return save;
}

/**
 *
 * @param dataframeName Name of output dataframe ex. foo in `foo=df.bifrost.plot()`
 * @param spec Updated graph spec.
 * @param columnNameMap Mapping from Draco-compliant column names to originals.
 */
function updateDfCode(
  dataframeName: string,
  spec: GraphSpec,
  columnNameMap: Record<string, string>
): string {
  const updateField = (filter: { field: string }) =>
    (filter.field = columnNameMap[filter.field]);

  const revertedSpec = produce(spec, (gs: GraphSpec) => {
    const compounds = ['and', 'or', 'not'];
    gs.transform.forEach(({ filter }) => {
      const filterKeys = Object.keys(filter);
      const compoundOp = compounds.find((c) => filterKeys.find((k) => c === k));
      if (compoundOp) {
        filter[compoundOp].forEach(updateField);
      } else {
        updateField(filter);
      }
    });
  });

  const translator = new VegaPandasTranslator();
  return translator
    .convertSpecToCode(revertedSpec)
    .replace(/\$df/g, dataframeName || 'df');
}
