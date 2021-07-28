/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { VegaLite } from 'react-vega';
import { useModelState } from '../hooks/bifrost-model';
import { deleteSpecFilter, updateSpecFilter } from '../modules/VegaFilters';

const graphCss = css`
  .vega-embed.has-actions {
    details {
      position: absolute;
      top: -28px;
      left: 75px;
    }
  }
`;
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
    setSpec(snapshotSpec);

    setGraphBounds({});
  }

  const data = useModelState('graph_data')[0];
  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div css={graphCss} onDoubleClick={resetBrushView}>
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
