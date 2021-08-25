/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useEffect, useMemo } from 'react';
import { X, Sliders, XCircle } from 'react-feather';
import { useModelState } from '../../../hooks/bifrost-model';
import { BifrostTheme } from '../../../theme';
import {
  VegaEncoding,
  vegaAggregationList,
  vegaScaleList,
} from '../../../modules/VegaEncodings';
import RangeSlider from '../../ui-widgets/RangeSlider';
import useSpecHistory from '../../../hooks/useSpecHistory';
import { updateSpecFilter, getCategories } from '../../../modules/VegaFilters';

const screenCss = (theme: BifrostTheme) => css`
  position: absolute;
  top: 0;
  background-color: ${theme.color.background[0]};
  width: 100%;
  height: 100%;
  padding: 15px;

  .filter-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  nav {
    padding-bottom: 5px;
  }

  h2 {
    font-weight: 700;
    margin: 0;
    .encoding {
      color: ${theme.color.primary.dark};
    }
  }

  h3 {
    margin: 6px 0;
  }

  .close-slider {
    display: inline-block;
    margin-left: 5px;
  }

  .add-range {
    margin: 10px 0;
    margin-left: 10px;
    color: ${theme.color.primary.dark};
  }

  .field-wrapper {
    display: inline-block;
    margin: 10px;
  }

  .field-label {
    display: block;
    font-size: 17px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .RangeSlider {
    padding-left: 0px;
  }

  .transformation-section {
    display: flex;
    align-items: center;

    article {
      margin-right: 10px;

      select {
        padding: 5px;
      }

      .bin-checkbox {
        margin: 5px 0;
      }
    }
  }

  .binning-button {
    background-color: ${theme.color.primary.standard};
    color: white;
    padding: 5px;
    font-size: initial;

    &.clicked {
      background-color: ${theme.color.primary.dark};
    }
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: start;

    .toggle-all {
      margin-left: 10px;
      color: gray;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

interface FilterGroupProps {
  encoding: VegaEncoding;
  updateAggregation: (aggregation: string) => void;
}

export const filterMap: {
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
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const columnInfo = graphSpec.encoding[props.encoding];
  const Filters = filterMap[columnInfo.type];
  const { field } = graphSpec.encoding[props.encoding];
  useSpecHistory({
    saveOnDismount: true,
    description: `Filtered on ${field}`,
  });

  function updateAggregation(aggregation: string) {
    const newSpec = produce(graphSpec, (gs) => {
      gs.encoding[props.encoding].aggregate =
        aggregation === 'none' ? '' : aggregation;
    });
    setGraphSpec(newSpec);
  }

  return (
    <article css={screenCss}>
      <nav className="filter-nav">
        <h2
          style={{
            fontSize:
              Math.max(
                35 - (props.encoding.length + columnInfo.field.length) * 0.7,
                15
              ) + 'px',
          }}
        >
          <span className="encoding">{props.encoding}</span>
          {': '}
          <span className="column">{columnInfo.field}</span>
        </h2>
        <button className="wrapper" onClick={props.onBack}>
          <XCircle />
        </button>
      </nav>
      <div className="filter-contents">
        <Filters
          encoding={props.encoding}
          updateAggregation={updateAggregation}
        />
      </div>
    </article>
  );
}

function QuantitativeFilters(props: FilterGroupProps) {
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const [columnRanges] = useModelState('df_column_ranges');
  const { field } = graphSpec.encoding[props.encoding];
  const currentAggregation = graphSpec.encoding[props.encoding].aggregate;
  const currentScale =
    graphSpec.encoding[props.encoding].scale?.type || 'linear';
  const bounds = columnRanges[field];
  const ranges = getRanges();

  // Initialize a slider if one doesn't exist
  useEffect(() => {
    if (!ranges.length) {
      updateRange(bounds, 0);
    }
  }, []);

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

  function updateRange(range: readonly number[], index: number) {
    const newSpec = updateSpecFilter(graphSpec, field, 'range', range, {
      occurrence: index + 1,
    });
    setGraphSpec(newSpec);
  }

  function updateScale(scale: string) {
    setGraphSpec(
      produce(graphSpec, (gs) => {
        gs.encoding[props.encoding].scale = { type: scale };
        const axisTitle = scale === 'linear' ? field : field + ` (${scale})`;
        if (gs.encoding[props.encoding].axis) {
          gs.encoding[props.encoding].axis!.title = axisTitle;
        } else {
          gs.encoding[props.encoding].axis = { title: axisTitle };
        }
      })
    );
  }

  function updateBin(e: React.ChangeEvent<HTMLInputElement>) {
    setGraphSpec(
      produce(graphSpec, (gs) => {
        gs.encoding[props.encoding].bin = e.target.checked;
      })
    );
  }

  return (
    <section className="quantitative-filters">
      <article className={'range-article'}>
        <h3>Range</h3>
        <section>
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
        </section>
      </article>
      <section className={'transformation-section'}>
        <article className={'aggregation-article'}>
          <h3>Aggregation</h3>
          <select
            value={currentAggregation}
            onChange={(e) => props.updateAggregation(e.target.value)}
          >
            {['none', ...vegaAggregationList].map((aggregation) => (
              <option value={aggregation}>{aggregation}</option>
            ))}
          </select>
        </article>
        <article className={'scaling-article'}>
          <h3>Scale</h3>

          <select
            value={currentScale}
            onChange={(e) => updateScale(e.target.value)}
          >
            {vegaScaleList.map((scale) => (
              <option value={scale}>{scale}</option>
            ))}
          </select>
        </article>
        {['x', 'y'].includes(props.encoding) ? (
          <article className={'binning-article'}>
            <h3>Bin</h3>
            <input
              className="bin-checkbox"
              type="checkbox"
              onChange={updateBin}
            />
          </article>
        ) : null}
      </section>
    </section>
  );
}

function CategoricalFilters(props: FilterGroupProps) {
  const [graphData] = useModelState('graph_data');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const { field } = graphSpec.encoding[props.encoding];
  const categories = useMemo(() => getCategories(graphData, field), []);
  const selectedCategories = useMemo(getSelectedCategories, [graphSpec]);
  const currentAggregation = graphSpec.encoding[props.encoding].aggregate;

  function getSelectedCategories(): Set<string> {
    const type = 'oneOf';
    const filteredCategories = graphSpec.transform.find(
      (f) => 'field' in f.filter && f.filter.field === field && type in f.filter
    )?.filter[type] as string[] | undefined;
    return new Set(filteredCategories || new Set(categories));
  }

  function updateFilter(
    type: string,
    setCategory: (currentVal: string[] | null) => string[]
  ) {
    const newSpec = updateSpecFilter<string[]>(
      graphSpec,
      field,
      type,
      setCategory
    );
    setGraphSpec(newSpec);
  }

  function selectCategory(e: React.ChangeEvent<HTMLInputElement>) {
    const category = e.target.value;
    updateFilter('oneOf', (currentCategories) => {
      if (!currentCategories) {
        const categories = Array.from(selectedCategories);
        return categories.filter((cat) => cat !== category);
      }
      if (e.target.checked) {
        return [...currentCategories, category];
      } else {
        return currentCategories.filter((c) => c !== category);
      }
    });
  }

  function toggleAll() {
    updateFilter('oneOf', (currentCategories) => {
      if (currentCategories?.length) {
        return [];
      } else {
        return categories;
      }
    });
  }

  return (
    <div>
      <header className="category-header">
        <h3>Category</h3>
        <span className="toggle-all" onClick={toggleAll}>
          {selectedCategories.size ? 'Uncheck All' : 'Check All'}
        </span>
      </header>

      <ul style={{ listStyle: 'none' }}>
        {categories.map((category) => (
          <li key={category}>
            <label className="choice">
              <input
                type="checkbox"
                value={category}
                checked={selectedCategories.has(category)}
                onChange={selectCategory}
              />{' '}
              {category}
            </label>
          </li>
        ))}
      </ul>
      <article className={'aggregation-article'}>
        <h3>Aggregation</h3>
        <select
          value={currentAggregation}
          onChange={(e) => props.updateAggregation(e.target.value)}
        >
          {['none', 'count'].map((aggregation) => (
            <option value={aggregation}>{aggregation}</option>
          ))}
        </select>
      </article>
    </div>
  );
}
