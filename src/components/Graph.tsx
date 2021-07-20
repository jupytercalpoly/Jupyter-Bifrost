/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite } from 'react-vega';
import { useModelState } from '../hooks/bifrost-model';
import { deleteSpecFilter, updateSpecFilter } from '../modules/VegaFilters';

export default function Graph() {
  const [selectedData, setSelectedData] = useModelState('selected_data');
  const [spec, setSpec] = useModelState('graph_spec');
  const [graphBounds, setGraphBounds] = useModelState('graph_bounds');

  function handleBrush(...args: any) {
    setSelectedData(args);
  }

  function updateGraphBounds() {
    const brushIsActive = Object.keys(selectedData[1]).length;
    if (!brushIsActive) {
      return;
    }
    const graphBounds = selectedData[1];
    console.log(graphBounds);

    // Assign the ranges to the spec
    const fields = Object.keys(graphBounds);
    const snapshotSpec = fields.reduce((newSpec, field) => {
      const fieldInfo = Object.values(spec.encoding).find(
        (info) => info.field === field
      );
      const type = fieldInfo.type as string;
      if (!fieldInfo) {
        return newSpec;
      }
      return updateSpecFilter(
        newSpec,
        field,
        type === 'quantitative' ? 'range' : 'oneOf',
        graphBounds[field],
        { compoundOperator: 'and' }
      );
    }, spec);
    console.log(selectedData[1], snapshotSpec);
    setSpec(snapshotSpec);

    setGraphBounds(graphBounds);
  }

  function resetBrushView() {
    const fields = Object.keys(graphBounds);
    const snapshotSpec = fields.reduce((newSpec, field) => {
      const fieldInfo = Object.values(spec.encoding).find(
        (info) => info.field === field
      );
      const type = fieldInfo.type as string;
      if (!fieldInfo) {
        return newSpec;
      }
      return deleteSpecFilter(
        newSpec,
        field,
        type === 'quantitative' ? 'range' : 'oneOf',
        { compoundOperator: 'and' }
      );
    }, spec);
    console.log(spec, snapshotSpec);
    setSpec(snapshotSpec);

    setGraphBounds({});
  }

  const data = useModelState('graph_data')[0];
  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div onDoubleClick={resetBrushView}>
      <div
        onMouseUp={updateGraphBounds}
        onMouseLeave={() => setSelectedData(['brush', {}])}
      >
        <VegaLite
          spec={spec}
          data={graphData}
          signalListeners={signalListeners}
        />
      </div>
    </div>
  );
}
