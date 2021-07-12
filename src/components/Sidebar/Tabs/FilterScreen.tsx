/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useMemo } from 'react';
import { ArrowLeft } from 'react-feather';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import { BifrostTheme } from '../../../theme';
import {
  VegaEncoding,
  vegaAggregationList,
} from '../../../modules/VegaEncodings';
import { isFunction } from '../../../modules/utils';
import RangeSlider from '../../ui-widgets/RangeSlider';

const screenCss = (theme: BifrostTheme) => css`
  position: absolute;
  top: 0;
  background-color: ${theme.color.background[0]};
  width: 100%;
  height: 100%;
  overflow-y: scroll;

  h1 {
    .encoding {
      color: ${theme.color.primary.dark};
    }
  }

  h2 {
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
      <h2>Filters</h2>
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
  const rangeValues = getFilterVal<[number, number]>('range');

  function getBounds(): [number, number] {
    return graphData.reduce(
      (minMax, cur) => {
        const val = cur[field];
        if (minMax[0] > val) {
          minMax[0] = val;
        }
        if (minMax[1] < val) {
          minMax[1] = val;
        }
        return minMax;
      },
      [Infinity, -Infinity]
    );
  }

  // function updateFilter(type: string, val: number) {
  //   const newSpec = updateSpecFilter(graphSpec, props.encoding, type, val);
  //   setGraphSpec(newSpec);
  // }

  function getFilterVal<T>(type: string): T {
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

  function updateRange(range: readonly number[]) {
    const newSpec = updateSpecFilter(graphSpec, props.encoding, 'range', range);
    setGraphSpec(newSpec);
  }

  return (
    <div className="filters">
      <RangeSlider
        width={300}
        domain={bounds}
        values={rangeValues}
        onUpdate={updateRange}
      />

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
  const [graphSpec, setGraphSpec] = useModelState<GraphSpec>('graph_spec');
  const categories = useMemo(getCategories, []);

  function getCategories() {
    const { field } = graphSpec.encoding[props.encoding];
    const categorySet = graphData.reduce((categories, row) => {
      categories.add(row[field]);
      return categories;
    }, new Set<string>());

    return Array.from(categorySet);
  }

  function updateFilter(
    type: string,
    setCategory: (currentVal: string[] | null) => string[]
  ) {
    const newSpec = updateSpecFilter<string[]>(
      graphSpec,
      props.encoding,
      type,
      setCategory
    );
    setGraphSpec(newSpec);
  }

  function selectCategory(e: React.ChangeEvent<HTMLInputElement>) {
    const category = e.target.value;
    updateFilter('oneOf', (currentCategories) => {
      if (!currentCategories) {
        return [category];
      }
      if (e.target.checked) {
        return [...currentCategories, category];
      } else {
        return currentCategories.filter((c) => c !== category);
      }
    });
  }

  return (
    <ul style={{ listStyle: 'none' }}>
      {categories.map((category) => (
        <li key={category}>
          <label className="choice">
            <input type="checkbox" value={category} onChange={selectCategory} />{' '}
            {category}
          </label>
        </li>
      ))}
    </ul>
  );
}

function updateSpecFilter<T>(
  graphSpec: GraphSpec,
  encoding: VegaEncoding,
  type: string,
  val: T | ((currentVal: T | null) => T)
) {
  const { field } = graphSpec.encoding[encoding];
  const index = graphSpec.transform.findIndex(
    (t) => t.filter.field === field && type in t.filter
  );
  const filterFound = index !== -1;
  let value: T;
  if (isFunction(val)) {
    const currentVal = filterFound
      ? graphSpec.transform[index].filter[type]
      : null;
    value = val(currentVal);
  } else {
    value = val;
  }

  let newSpec: GraphSpec;
  if (filterFound) {
    // Filter exists
    newSpec = produce(graphSpec, (gs) => {
      gs.transform[index].filter[type] = value;
    });
  } else {
    // Create Filter
    newSpec = produce(graphSpec, (gs) => {
      gs.transform.push({
        filter: {
          field,
          [type]: value,
        },
      });
    });
  }
  return newSpec;
}
