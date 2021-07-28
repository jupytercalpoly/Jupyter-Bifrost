/** @jsx jsx */
import { jsx, css } from '@emotion/react';
// import { VegaLite } from 'react-vega';
import { useModelState, GraphSpec } from '../hooks/bifrost-model';
import {
  deleteSpecFilter,
  getBounds,
  updateSpecFilter,
} from '../modules/VegaFilters';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BifrostVega from '../modules/BifrostVega';
import { View } from 'vega';
import theme from '../theme';
import { VegaEncoding } from '../modules/VegaEncodings';
import RangeSlider from './ui-widgets/RangeSlider';

const graphCss = css`
  padding-left: 34px;
  .vega-embed.has-actions {
    details {
      position: absolute;
      top: -28px;
      left: 75px;
    }
  }

  g.mark-text.role-axis-title {
    text.hovered {
      fill: ${theme.color.primary.dark};
    }
  }
`;

const axisCss = css`
  cursor: pointer;
`;

interface GraphProps {
  sideBarRef: React.RefObject<HTMLDivElement>;
}

export default function Graph(props: GraphProps) {
  const [selectedData, setSelectedData] = useModelState('selected_data');
  const [spec, setSpec] = useModelState('graph_spec');
  const [graphBounds, setGraphBounds] = useModelState('graph_bounds');
  const [columnTypes] = useModelState('column_types');
  const data = useModelState('graph_data')[0];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [clickedAxis, setClickedAxis] = useState<string>('');

  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  function handleBrush(...args: any) {
    setSelectedData(args);
  }

  function getAxisBoundingBoxes(
    wrapper: HTMLDivElement
  ): Record<string, Record<string, number>> {
    const axisLabels = wrapper.querySelectorAll('.mark-text.role-axis-title');

    const boundingBoxes: Record<string, Record<string, number>> = {};
    axisLabels.forEach((axisLabel) => {
      const boundingBox = axisLabel.getBoundingClientRect();
      const title = axisLabel.textContent ? axisLabel.textContent : '';
      boundingBoxes[title] = {
        top: boundingBox.top,
        right: boundingBox.right,
        bottom: boundingBox.bottom,
        left: boundingBox.left,
      };
    });
    return boundingBoxes;
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

  function resetOtherAxis(channel: VegaEncoding): boolean {
    if (!wrapperRef.current) {
      return false;
    }
    const wrapper = wrapperRef.current;

    let axisWrapper;

    if (channel === 'x') {
      axisWrapper = wrapper.getElementsByClassName(
        'y-axis-wrapper'
      )[0] as HTMLElement;
    } else if (channel === 'y') {
      axisWrapper = wrapper.getElementsByClassName(
        'x-axis-wrapper'
      )[0] as HTMLElement;
    }

    if (axisWrapper && axisWrapper?.classList.contains('clicked')) {
      axisWrapper?.classList.remove('clicked');

      if (axisWrapper?.classList.contains('x-axis-wrapper')) {
        return true;
      }
    }
    return false;
  }

  function handleClickOnAxis(event: React.MouseEvent, channel: VegaEncoding) {
    const axisWrapper = event.currentTarget as HTMLElement;

    axisWrapper.classList.toggle('clicked');

    const checkOffset = resetOtherAxis(channel);

    const field = spec.encoding[channel].field;
    let resetClick = false;

    const variableTab = props.sideBarRef.current?.querySelectorAll(
      '.TabBar li'
    )[0] as HTMLElement;

    variableTab.click();

    const encodingList =
      props.sideBarRef.current?.getElementsByClassName('encoding-list')[0];

    if (!encodingList) {
      if (axisWrapper.classList.contains('clicked')) {
        axisWrapper.classList.remove('clicked');
        resetClick = true;
      }
    } else {
      const pills = encodingList.getElementsByTagName('li');

      if (pills) {
        Array.from(pills).forEach((pill) => {
          if (
            pill.querySelector('.encoding-wrapper span')?.textContent === field
          ) {
            pill.click();
            if (['nominal', 'ordinal'].includes(columnTypes[field])) {
              pill.querySelectorAll('button')[1]?.click();
            }
          }
        });
      }
    }
    if (!resetClick) {
      placeAxisWrappers(false, channel, checkOffset);
    }

    let newChannel = clickedAxis === channel ? '' : channel;

    if (resetClick) {
      newChannel = '';
    }

    setClickedAxis(newChannel);
  }

  function placeAxisWrappers(
    onNewView: boolean,
    clickedChannel?: VegaEncoding,
    checkOffset?: boolean
  ) {
    if (!wrapperRef.current) {
      return;
    }
    const wrapper = wrapperRef.current;
    const parentBoundingBox = wrapper.getBoundingClientRect();
    const axisBoundingBoxes = getAxisBoundingBoxes(wrapper);

    const fields = Object.keys(axisBoundingBoxes);
    const xAxisBooundingBox = axisBoundingBoxes[fields[0]];
    const yAxisBoundingBox = axisBoundingBoxes[fields[1]];

    const xAxisWrapper = wrapper.getElementsByClassName(
      'x-axis-wrapper'
    )[0] as HTMLElement;

    const yAxisWrapper = wrapper.getElementsByClassName(
      'y-axis-wrapper'
    )[0] as HTMLElement;

    let offset = 0;
    if (
      clickedChannel &&
      clickedChannel === 'x' &&
      !onNewView &&
      ['quantitative', 'temporal'].includes(spec.encoding[clickedChannel].type)
    ) {
      offset = xAxisWrapper.classList.contains('clicked') ? 40 : -40;
    }
    // handling edge case when y axis is clicked when x axis is clicked
    if (checkOffset && offset !== -40) {
      offset = -40;
    }

    if (xAxisBooundingBox) {
      xAxisWrapper.setAttribute(
        'style',
        `width:${xAxisBooundingBox.right - xAxisBooundingBox.left}px; height: ${
          xAxisBooundingBox.bottom - xAxisBooundingBox.top
        }px;
        position: absolute;
        left: ${xAxisBooundingBox.left - parentBoundingBox.left}px;
        bottom: ${
          parentBoundingBox.bottom - xAxisBooundingBox.bottom + offset
        }px;
        `
      );
    }

    if (yAxisBoundingBox) {
      yAxisWrapper.setAttribute(
        'style',
        `width:${yAxisBoundingBox.right - yAxisBoundingBox.left}px; height: ${
          yAxisBoundingBox.bottom - yAxisBoundingBox.top
        }px;
        position: absolute;
        left: ${yAxisBoundingBox.left - parentBoundingBox.left}px;
        bottom: ${
          parentBoundingBox.bottom - yAxisBoundingBox.bottom + offset
        }px;`
      );
    }
  }

  function onNewView(view: View) {
    setTimeout(() => placeAxisWrappers(true), 100);
  }

  function handleMouseEnter(event: React.MouseEvent, channel: VegaEncoding) {
    if (!wrapperRef) {
      return;
    }
    const wrapper = wrapperRef.current;
    if (channel === 'x') {
      const xAxis = wrapper?.querySelectorAll(
        'g.mark-text.role-axis-title text'
      )[0];
      xAxis?.classList.add('hovered');
    } else {
      const yAxis = wrapper?.querySelectorAll(
        'g.mark-text.role-axis-title text'
      )[1];
      yAxis?.classList.add('hovered');
    }
  }

  function handleMouseLeave(event: React.MouseEvent, channel: VegaEncoding) {
    if (!wrapperRef) {
      return;
    }
    const wrapper = wrapperRef.current;
    if (channel === 'x') {
      const xAxis = wrapper?.querySelectorAll(
        'g.mark-text.role-axis-title text'
      )[0];
      xAxis?.classList.remove('hovered');
    } else {
      const yAxis = wrapper?.querySelectorAll(
        'g.mark-text.role-axis-title text'
      )[1];
      yAxis?.classList.remove('hovered');
    }
  }

  return (
    <div ref={wrapperRef} css={graphCss} onDoubleClick={resetBrushView}>
      <div
        onMouseUp={updateGraphBounds}
        onMouseLeave={() => setSelectedData(['brush', {}])}
      >
        <BifrostVega
          spec={spec}
          data={graphData}
          signalListeners={signalListeners}
          renderer={'svg'}
          onNewView={onNewView}
        />
      </div>
      <div
        className="x-axis-wrapper"
        onClick={(event) => handleClickOnAxis(event, 'x')}
        onMouseEnter={(event) => handleMouseEnter(event, 'x')}
        onMouseLeave={(event) => handleMouseLeave(event, 'x')}
        css={axisCss}
      ></div>
      <div
        className="y-axis-wrapper"
        onClick={(event) => handleClickOnAxis(event, 'y')}
        onMouseEnter={(event) => handleMouseEnter(event, 'y')}
        onMouseLeave={(event) => handleMouseLeave(event, 'y')}
        css={axisCss}
      ></div>
      {clickedAxis !== '' &&
        !['nominal', 'oridnal'].includes(
          spec.encoding[clickedAxis as VegaEncoding].type
        ) && (
          <AxisRangeSlider
            graphSpec={spec}
            setGraphSpec={setSpec}
            field={spec.encoding[clickedAxis as VegaEncoding].field}
            axis={clickedAxis}
          />
        )}
    </div>
  );
}

function AxisRangeSlider({
  graphSpec,
  setGraphSpec,
  field,
  axis,
}: {
  graphSpec: GraphSpec;
  setGraphSpec: (val: GraphSpec, options?: any) => void;
  field: string;
  axis: string;
}) {
  const [graphData] = useModelState('graph_data');
  const bounds = useMemo(() => getBounds(graphData, field), [field]);
  const range = getRange();

  // Initialize a slider if one doesn't exist
  useEffect(() => {
    if (!range) {
      updateRange(bounds);
    }
  }, []);

  function getRange(): [number, number] | undefined {
    const type = 'range';
    const foundTransform = graphSpec.transform.find(
      (f) =>
        'or' in f.filter &&
        f.filter.or[0]?.field === field &&
        type in f.filter.or[0]
    );
    return foundTransform?.filter.or?.[0][type];
  }

  function updateRange(range: readonly number[]) {
    let newRange = range.slice();
    if (range[0] > range[1]) {
      newRange = [range[1], range[0]];
    }
    const newSpec = updateSpecFilter(graphSpec, field, 'range', newRange);

    setGraphSpec(newSpec);
  }

  const axisStyles: React.CSSProperties | undefined =
    axis === 'y'
      ? {
          position: 'absolute',
          bottom: '-20px',
          left: '-450px',
          transformOrigin: 'right center',
          transform: 'rotate(90deg)',
        }
      : undefined;

  const width = axis === 'y' ? 470 : 640;

  return (
    <div style={axisStyles}>
      <RangeSlider
        width={width}
        domain={bounds}
        values={range}
        onUpdate={(update) => updateRange(update)}
        vertical={axis === 'y'}
        reversed={axis === 'y'}
        onAxis={true}
      />
    </div>
  );
}
