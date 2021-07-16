/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, X, Sliders } from 'react-feather';
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

  .close-slider {
    display: inline-block;
    margin-left: 5px;
  }

  .add-range {
    margin: 10px 0;
    margin-left: 10px;
    color: ${theme.color.primary[0]};
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
  const [graphSpec] = useModelState('graph_spec');
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

function QuantitativeFilters(props: FilterGroupProps) {
  const [graphData] = useModelState('graph_data');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const { field } = graphSpec.encoding[props.encoding];
  const currentAggregation = graphSpec.encoding[props.encoding].aggregate;
  const bounds = useMemo(getBounds, [graphData]);
  const ranges = getRanges();

  useEffect(() => {
    if (!ranges.length) {
      updateRange(bounds, 0);
    }
  }, []);

  function getBounds(): [number, number] {
    return graphData.reduce(
      (minMax, cur) => {
        const val = cur[field] as number;
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

  function getRanges(): [number, number][] {
    const type = 'range';
    return (
      graphSpec.transform
        .find(
          (f) =>
            'or' in f.filter &&
            f.filter.or[0]?.field === field &&
            type in f.filter.or[0]
        )
        ?.filter.or.map((f: any) => f[type]) || []
    );
  }

  function deleteRange(index: number) {
    const newSpec = produce(graphSpec, (gs) => {
      const compoundIdx = gs.transform.findIndex(
        (f) =>
          'or' in f.filter &&
          f.filter.or[0]?.field === field &&
          'range' in f.filter.or[0]
      );

      if (compoundIdx === -1) {
        return;
      }
      const ranges = gs.transform[compoundIdx].filter.or;
      if (ranges.length === 1) {
        // Delete entire compound block
        gs.transform.splice(compoundIdx, 1);
      } else {
        // Delete range in compound block
        ranges.splice(index, 1);
      }
    });

    setGraphSpec(newSpec);
  }

  function updateAggregation(aggregation: string) {
    const newSpec = produce(graphSpec, (gs) => {
      gs.encoding[props.encoding].aggregate =
        aggregation === 'none' ? '' : aggregation;
    });
    setGraphSpec(newSpec);
  }

  function updateRange(range: readonly number[], index: number) {
    const newSpec = updateSpecFilter(
      graphSpec,
      props.encoding,
      'range',
      range,
      index + 1
    );
    setGraphSpec(newSpec);
  }

  return (
    <div className="filters">
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
      {ranges.map((r, i) => (
        <div style={{ display: 'flex' }}>
          <RangeSlider
            width={300}
            domain={bounds}
            values={r}
            onUpdate={(update) => updateRange(update, i)}
          />
          <button
            className="close-slider wrapper"
            onClick={() => deleteRange(i)}
          >
            <X size={20} />
          </button>
        </div>
      ))}
      <button
        className="wrapper block add-range"
        onClick={() => updateRange(bounds, ranges.length)}
      >
        + <Sliders />
      </button>
    </div>
  );
}

function CategoricalFilters(props: FilterGroupProps) {
  const [graphData] = useModelState('graph_data');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const categories = useMemo(getCategories, []);

  function getCategories() {
    const { field } = graphSpec.encoding[props.encoding];
    const categorySet = graphData.reduce((categories, row) => {
      categories.add(row[field] as string);
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

/**
 *
 * @param graphSpec The Vega Graph Spec that will be the basis for the new filter.
 * @param encoding Encoding variable target of the filter.
 * @param type Type of filter.
 * @param val Filter value to be applied to the graph.
 * @param occurrence If several of the same type of filters, identifies the desired instance by index. Defaults to first (1).
 * @returns Updated spec.
 */
function updateSpecFilter<T>(
  graphSpec: GraphSpec,
  encoding: VegaEncoding,
  type: string,
  val: T | ((currentVal: T | null) => T),
  occurrence = 1
) {
  const { field } = graphSpec.encoding[encoding];

  let index = -1;
  let foundCount = 0;
  const isCompound = type === 'range';
  let compoundIndex = -1;
  let transforms: any;

  if (isCompound) {
    compoundIndex = graphSpec.transform.findIndex(
      (t) =>
        'or' in t.filter &&
        t.filter.or[0]?.field === field &&
        type in t.filter.or[0]
    );
    transforms =
      compoundIndex !== -1 ? graphSpec.transform[compoundIndex].filter.or : [];
  } else {
    transforms = graphSpec.transform.map((t) => t.filter);
  }

  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    if (t.field === field && type in t) {
      foundCount++;
    }
    if (foundCount === occurrence) {
      index = i;
      break;
    }
  }
  const filterFound = index !== -1;
  let value: T;
  if (isFunction(val)) {
    const currentVal = filterFound ? transforms[index][type] : null;
    value = val(currentVal);
  } else {
    value = val;
  }
  const newSpec = produce(graphSpec, (gs) => {
    if (isCompound) {
      if (filterFound) {
        // Filter exists in compound
        gs.transform[compoundIndex].filter.or[index][type] = value;
      } else if (compoundIndex !== -1) {
        // Compound exists but not filter
        gs.transform[compoundIndex].filter.or.push({
          field,
          [type]: value,
        });
      } else {
        // Compound doesn't exist. Create the compound.
        gs.transform.push({ filter: { or: [{ field, range: value }] } });
      }
    } else {
      if (filterFound) {
        // Filter exists
        gs.transform[index].filter[type] = value;
      } else {
        // Create Filter
        gs.transform.push({
          filter: {
            field,
            [type]: value,
          },
        });
      }
    }
  });
  return newSpec;
}
