import produce from 'immer';
import { useEffect, useRef, useState } from 'react';
import VegaPandasTranslator from '../modules/VegaPandasTranslator';
import { GraphSpec, useModelState } from './bifrost-model';

interface SpecHistoryOptions {
  saveOnDismount?: boolean;
  description?: string;
}

/**
 * Keeps track of history and saves Graph Specs.
 * @param options Adaptations to how saving state should be handled
 * @returns a function that can manually save a graph spec to history
 */
export default function useSpecHistory(
  options: SpecHistoryOptions = { saveOnDismount: false, description: '' }
) {
  const [opHistory, setOpHistory] = useModelState('spec_history');
  const graphSpec = useModelState('graph_spec')[0];
  const [index, setIndex] = useModelState('current_dataframe_index');
  const setDfCode = useModelState('df_code')[1];
  const [columnMap] = useModelState('column_name_map');
  const [outputVar] = useModelState('output_variable');
  const [inputVar] = useModelState('df_variable_name');
  const [inputUrl] = useModelState('input_url');
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
   * @param description Description of the edit which will appear in history
   */
  function save(
    spec: GraphSpec = graphSpec,
    description: string = options.description || 'Graph Changed'
  ) {
    const hasChanged = originalSpec !== spec;
    const hasEncoding = Object.keys(spec.encoding).length;
    if (!hasChanged || !hasEncoding) {
      return;
    }
    const newHist = opHistory.slice(0, index + 1);
    const explainedSpec = produce(spec, (gs) => {
      gs.description = description;
    });
    newHist.push(explainedSpec);
    setOpHistory(newHist);
    setIndex(newHist.length - 1);
    setOriginalSpec(explainedSpec);
    setDfCode(
      updateDfCode(explainedSpec, inputVar, inputUrl, outputVar, columnMap)
    );
  }

  saveRef.current = save;

  return save;
}

function updateDfCode(
  spec: GraphSpec,
  inputDfName: string,
  inputUrl: string,
  outputDfName: string,
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
  return translator.convertSpecToCode(
    revertedSpec,
    inputDfName,
    inputUrl,
    outputDfName
  );
}
