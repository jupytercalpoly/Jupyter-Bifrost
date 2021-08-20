/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useEffect, useMemo, useState } from 'react';
import { X, Sliders } from 'react-feather';
import { useModelState } from '../../../hooks/bifrost-model';
import { BifrostTheme } from '../../../theme';
import {
  VegaEncoding,
  vegaAggregationList,
  vegaScaleList,
} from '../../../modules/VegaEncodings';
import RangeSlider from '../../ui-widgets/RangeSlider';
import useSpecHistory from '../../../hooks/useSpecHistory';
import {
  updateSpecFilter,
  getBounds,
  getCategories,
} from '../../../modules/VegaFilters';

const screenCss = (theme: BifrostTheme) => css`
  position: absolute;
  top: 0;
  background-color: ${theme.color.background[0]};
  width: 100%;
  height: 100%;

  .filter-contents {
  }
  nav {
    padding-bottom: 5px;
  }

  /* h1 {
    .encoding {
      color: ${theme.color.primary.dark};
    }
  } */

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
    margin-top: 20px;
    .encoding {
      color: ${theme.color.primary.dark};
    }
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

  .quantitative-filters {
    overflow: auto;
    height: 300px;
  }

  .transformation-section {
    display: flex;
    align-items: center;

    article {
      margin: 0 10px;

      select {
        padding: 5px;
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
      <nav>
        <button className="wrapper" onClick={props.onBack}>
          <X />
        </button>
      </nav>
      <div className="filter-contents">
        <h2>
          <span className="encoding">{props.encoding}</span>
          {': '}
          <span className="column">{columnInfo.field}</span>
        </h2>
        <Filters
          encoding={props.encoding}
          updateAggregation={updateAggregation}
        />
      </div>
    </article>
  );
}

function QuantitativeFilters(props: FilterGroupProps) {
  const [graphData] = useModelState('graph_data');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const [binned, setBinned] = useState<boolean>(
    graphSpec.encoding[props.encoding].bin ?? false
  );
  const { field } = graphSpec.encoding[props.encoding];
  const currentAggregation = graphSpec.encoding[props.encoding].aggregate;
  const currentScale =
    graphSpec.encoding[props.encoding].scale?.type || 'linear';
  const bounds = useMemo(
    () => getBounds(graphData, field),
    [graphData, currentAggregation]
  );
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

  function updateBin() {
    setBinned((binned) => {
      setGraphSpec(
        produce(graphSpec, (gs) => {
          gs.encoding[props.encoding].bin = !binned;
        })
      );
      return !binned;
    });
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
          <h3>Transformation</h3>
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
        <article className={'binning-article'}>
          <h3>Bin</h3>
          <button
            className={binned ? 'binning-button clicked' : 'binning-button'}
            onClick={updateBin}
          >
            {binned ? 'Binned' : 'Bin'}
          </button>
          {/* <input
            type="checkbox"
            onChange={updateBin}
            style={{ display: 'inline-block' }}
          /> */}
        </article>
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

  function getSelectedCategories() {
    const type = 'oneOf';
    const filteredCategories = graphSpec.transform.find(
      (f) => 'field' in f.filter && f.filter.field === field && type in f.filter
    )?.filter[type] as string[] | undefined;
    return new Set(filteredCategories || categories);
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

  return (
    <div>
      <h3>Category</h3>

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
        <h3>Transformation</h3>
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
