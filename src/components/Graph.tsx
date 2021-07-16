/** @jsx jsx */
<<<<<<< HEAD
import { jsx, css } from '@emotion/react';
import { VegaLite } from 'react-vega';
=======
import { jsx } from '@emotion/react';
// import { VegaLite } from 'react-vega';
>>>>>>> 06de7db (Started working on clicking axis to change variable)
import { useModelState } from '../hooks/bifrost-model';
import { deleteSpecFilter, updateSpecFilter } from '../modules/VegaFilters';
import { useEffect, useRef } from 'react';
import Vega from './BifrostVega';

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
  const data = useModelState('graph_data')[0];
  const graphData = { data };

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }
    const wrapper = wrapperRef.current;

    const axisLabels = wrapper.querySelectorAll('.mark-group.role-axis');
    console.log(axisLabels);

    function logTest() {
      console.log('clicked');
    }
    // debugger;

    axisLabels.forEach((axisTitle) => {
      axisTitle.addEventListener('click', logTest);
    });

    return () =>
      void axisLabels.forEach((axisTitle) => {
        axisTitle.removeEventListener('click', logTest);
      });
  }, [wrapperRef.current, spec, graphData]);

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

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
<<<<<<< HEAD
    <div css={graphCss} onDoubleClick={resetBrushView}>
=======
    <div ref={wrapperRef} onDoubleClick={resetBrushView}>
>>>>>>> 06de7db (Started working on clicking axis to change variable)
      <div
        onMouseUp={updateGraphBounds}
        onMouseLeave={() => setSelectedData(['brush', {}])}
      >
        <Vega
          spec={spec}
          data={graphData}
          signalListeners={signalListeners}
          renderer={'svg'}
        />
      </div>
    </div>
  );
}
