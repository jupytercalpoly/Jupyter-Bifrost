/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useMemo } from 'react';
import { ArrowLeft } from 'react-feather';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import {
  VegaEncoding,
  vegaAggregationList,
} from '../../../modules/VegaEncodings';

const screenCss = (theme: any) => css`
  position: absolute;
  top: 0;
  background-color: ${theme.color.background[0]};
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  h1 {
    .encoding {
      color: ${theme.color.primary};
    }
  }
`;

interface FilterGroupProps {
  encoding: VegaEncoding;
}

const filterMap: {
  [type: string]: (props: FilterGroupProps) => jsx.JSX.Element;
} = {
  quantitative: QuantitativeFilters,
  nominal: CategoricalFilters,
};

interface FilterScreenProps {
  encoding: VegaEncoding;
  onBack(): void;
}

export default function FilterScreen(props: FilterScreenProps) {
  const [graphSpec] = useModelState<GraphSpec>('graph_spec');
  const columnInfo = graphSpec.encoding[props.encoding];
  const Filters = filterMap[columnInfo.type];

  return (
    <article css={screenCss}>
      <button className="wrapper" onClick={props.onBack}>
        <ArrowLeft />
      </button>
      <h1>
        <span className="encoding">{props.encoding}</span>{' '}
        <span className="column">{columnInfo.field}</span>
      </h1>
      <Filters encoding={props.encoding} />
    </article>
  );
}

type GraphData<T> = { [col: string]: T }[];

function QuantitativeFilters(props: FilterGroupProps) {
  const [graphData] = useModelState<GraphData<number>>('graph_data');
  const [graphSpec, setGraphSpec] = useModelState<GraphSpec>('graph_spec');
  const { field } = graphSpec.encoding[props.encoding];
  const currentAggregation = graphSpec.encoding[props.encoding].aggregate;
  const bounds = useMemo(getBounds, [graphData]);
  const currentMin = getFilterVal('gte') || bounds[0];
  const currentMax = getFilterVal('lte') || bounds[1];

  function getBounds(): [number, number] {
    return graphData.reduce(
      (minMax, cur) => {
        let val = cur[field];
        if (minMax[0] > val) minMax[0] = val;
        if (minMax[1] < val) minMax[1] = val;
        return minMax;
      },
      [Infinity, -Infinity]
    );
  }

  function updateFilter(type: string, val: number) {
    const index = graphSpec.transform.findIndex(
      (t) => t.filter.field === field && type in t.filter
    );
    let newSpec: GraphSpec;
    if (index !== -1) {
      // Filter exists
      newSpec = produce(graphSpec, (gs) => {
        gs.transform[index].filter[type] = val;
      });
    } else {
      // Create Filter
      newSpec = produce(graphSpec, (gs) => {
        gs.transform.push({
          filter: {
            field,
            [type]: val,
          },
        });
      });
    }
    setGraphSpec(newSpec);
    console.log(newSpec.transform);
  }

  function getFilterVal(type: string): number | undefined {
    return graphSpec.transform.find(
      (f) => f.filter.field === field && type in f.filter
    )?.filter[type];
  }

  function updateAggregation(aggregation: string) {
    const newSpec = produce(graphSpec, (gs) => {
      gs.encoding[props.encoding].aggregate =
        aggregation === 'none' ? '' : aggregation;
    });
    setGraphSpec(newSpec);
  }

  return (
    <div className="filters">
      <label>
        Min
        <input
          type="range"
          value={currentMin}
          min={bounds[0]}
          max={bounds[1]}
          step={(bounds[1] - bounds[0]) / 100}
          onChange={(e) => updateFilter('gte', e.target.valueAsNumber)}
        />
      </label>

      <label>
        Max:
        <input
          type="range"
          value={currentMax}
          min={bounds[0]}
          max={bounds[1]}
          step={(bounds[1] - bounds[0]) / 100}
          onChange={(e) => updateFilter('lte', e.target.valueAsNumber)}
        />
      </label>

      <label>
        Aggregation:{' '}
        <select
          value={currentAggregation}
          onChange={(e) => updateAggregation(e.target.value)}
        >
          {['none', ...vegaAggregationList].map((aggregation) => (
            <option value={aggregation}>{aggregation}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CategoricalFilters(props: FilterGroupProps) {
  const [graphData] = useModelState<GraphData<string>>('graph_data');

  return (
    <ul>
      {Object.keys(graphData[0]).map((k) => (
        <li key={k}>{k}</li>
      ))}
    </ul>
  );
}
