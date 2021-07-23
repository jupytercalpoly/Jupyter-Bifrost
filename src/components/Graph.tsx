/** @jsx jsx */
import { jsx, css } from '@emotion/react';
// import { VegaLite } from 'react-vega';
import { useModelState, GraphSpec } from '../hooks/bifrost-model';
import {
  deleteSpecFilter,
  getBounds,
  updateSpecFilter,
} from '../modules/VegaFilters';
import { useEffect, useMemo, useRef, useState } from 'react';
import BifrostVega from '../modules/BifrostVega';
import { ScenegraphEvent, View } from 'vega';
import theme from '../theme';
// import { filterMap } from '../components/Sidebar/Tabs/FilterScreen';
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
    cursor: pointer;
    pointer-events: all;

    text.hovered {
      fill: ${theme.color.primary.dark};
    }
  }
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

  function handleBrush(...args: any) {
    setSelectedData(args);
  }

  function checkBoundary(
    xCoord: number,
    yCoord: number,
    boundingBox: Record<string, number>
  ) {
    return (
      xCoord <= boundingBox.right &&
      xCoord >= boundingBox.left &&
      yCoord >= boundingBox.top &&
      yCoord <= boundingBox.bottom
    );
  }

  function getBoundingBoxes(
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

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  function onNewView(view: View) {
    function handleClickOnAxis(event: ScenegraphEvent) {
      if (!wrapperRef.current) {
        return;
      }
      const wrapper = wrapperRef.current;

      const boundingBoxes = getBoundingBoxes(wrapper);

      const xCoord = (event as MouseEvent).clientX;
      const yCoord = (event as MouseEvent).clientY;

      const clickedBox = Object.keys(boundingBoxes).filter((key) => {
        const boundingBox = boundingBoxes[key];
        return checkBoundary(xCoord, yCoord, boundingBox);
      })[0];

      if (!clickedBox) {
        return;
      }

      const variableTab = props.sideBarRef.current?.querySelectorAll(
        '.TabBar li'
      )[0] as HTMLElement;
      variableTab.click();

      const pills = props.sideBarRef.current
        ?.getElementsByClassName('encoding-list')[0]
        .getElementsByTagName('li');

      if (pills) {
        Array.from(pills).forEach((pill) => {
          if (
            pill.querySelector('.encoding-wrapper span')?.textContent ===
            clickedBox
          ) {
            pill.click();
            if (['nominal', 'ordinal'].includes(columnTypes[clickedBox])) {
              pill.querySelectorAll('button')[1]?.click();
            }
          }
        });
      }

      setClickedAxis((clickedAxis) => {
        const channel = Object.keys(spec.encoding).filter((channel) => {
          return spec.encoding[channel as VegaEncoding].field === clickedBox;
        })[0] as VegaEncoding;

        return clickedAxis === channel ? '' : channel;
      });
    }

    function handleMouseOverOnAxis(event: any) {
      if (!wrapperRef.current) {
        return;
      }
      const wrapper = wrapperRef.current;

      const axisLabels = wrapper.querySelectorAll('.mark-text.role-axis-title');
      const boundingBoxes = getBoundingBoxes(wrapper);

      Array.from(axisLabels).forEach((axisLabel) => {
        const xCoord = (event as MouseEvent).clientX;
        const yCoord = (event as MouseEvent).clientY;

        const hoveredBox = Object.keys(boundingBoxes).filter((key) => {
          const boundingBox = boundingBoxes[key];
          return checkBoundary(xCoord, yCoord, boundingBox);
        })[0];

        const axisTitle = axisLabel.getElementsByTagName('text')[0];

        if (!hoveredBox && axisTitle.classList.contains('hovered')) {
          axisTitle.classList.remove('hovered');
        } else if (hoveredBox && axisTitle.textContent === hoveredBox) {
          axisTitle.classList.add('hovered');
        }
      });
    }

    view.addEventListener('click', handleClickOnAxis);
    view.addEventListener('mouseover', handleMouseOverOnAxis);
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
  // const [graphSpec, setGraphSpec] = useModelState('graph_spec');
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

// transform: [
//   {filter: {type: "range", value: [1,2]}} // non compound
//   {filter: {and|or|not: [{field: "", "type" : "range", "value": [1,2]}]}} //compound
// ]
