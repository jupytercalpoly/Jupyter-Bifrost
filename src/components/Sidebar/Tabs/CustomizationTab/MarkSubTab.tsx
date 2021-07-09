/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';

import {
  vegaCategoricalChartList,
  vegaChartList,
  vegaTemporalChartList,
} from '../../../../modules/VegaEncodings';
import SearchBar from '../../../ui-widgets/SearchBar';
import { CustomizeSubTapProps } from './CustomizationTab';
import { GraphSpec, useModelState } from '../../../../hooks/bifrost-model';
import { PlainObject, VegaLite, VisualizationSpec } from 'react-vega';
import produce from 'immer';
import theme from '../../../../theme';

const markOptionsListCss = css`
  display: flex;
  flex-wrap: wrap;
  overflow: scroll;
  list-style: none;
  padding: 0px;
`;

const markOptionCss = css`
  display: flex;
  flex-direction: column;

  &.selected {
    border: 5px solid ${theme.color.onSelected};

    span {
      font-weight: bold;
    }
  }
`;

export default function MarkSubTab(props: CustomizeSubTapProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [results, setResults] = useState(
    vegaChartList.map((choice, index) => ({ choice, index }))
  );
  const data = useModelState<PlainObject>('graph_data', (data) => ({
    data,
  }))[0];
  const [selectedMark, setSelectedMark] = useState<
    string | Record<string, any>
  >(props.spec.mark);

  function handleOnClick(spec: GraphSpec) {
    const newSpec = produce(spec, (draftSpec: GraphSpec) => {
      draftSpec['width'] = props.spec.width;
      draftSpec['height'] = props.spec.height;
    });

    setSelectedMark(newSpec.mark);
    props.setSpec(newSpec);
  }

  return (
    <div className="mark-options-wrapper" style={{ width: '100%' }}>
      <SearchBar
        choices={vegaChartList}
        onResultsChange={setResults}
        onChange={setSearchValue}
        value={searchValue}
      />
      <ul className="mark-options" css={markOptionsListCss}>
        {results
          .filter(({ choice: kind }) => {
            if (vegaCategoricalChartList.includes(kind)) {
              const x = props.spec['encoding']['x'];
              const y = props.spec['encoding']['y'];
              if (
                (x['type'] === 'quantitative' && y['type'] === 'nominal') ||
                (y['type'] === 'quantitative' && x['type'] === 'nominal')
              ) {
                return true;
              } else {
                return false;
              }
            } else if (vegaTemporalChartList.includes(kind)) {
              const xType = props.spec['encoding']['x']['type'];
              const yType = props.spec['encoding']['y']['type'];
              if (
                ['temporal', 'ordinal'].includes(xType) &&
                yType === 'quantitative'
              ) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          })
          .map(({ choice: kind }) => {
            const spec = produce(props.spec, (draftSpec: GraphSpec) => {
              draftSpec['width'] = 100;
              draftSpec['height'] = 100;
              if (vegaCategoricalChartList.includes(kind)) {
                const x = draftSpec.encoding['x'];
                const y = draftSpec.encoding['y'];
                if (kind === 'errorband') {
                  draftSpec.mark = { type: kind, extent: 'ci', borders: true };
                } else if (kind === 'errorbar') {
                  draftSpec.mark = { type: kind, extent: 'ci', ticks: true };
                } else if (kind === 'arc') {
                  if (x['type'] === 'quantitative') {
                    draftSpec['encoding']['theta'] = x;
                    draftSpec['encoding']['color'] = y;
                  } else {
                    draftSpec['encoding']['theta'] = y;
                    draftSpec['encoding']['color'] = x;
                  }
                } else if (kind === 'boxplot') {
                  draftSpec.mark = { type: kind, extent: 'min-max' };
                }
              }
              //               else if (vegaTemporalChartList.includes(kind)) {

              // draftSpec.mark = kind;
              else {
                draftSpec.mark = kind;
              }
            });
            return (
              <li
                className={
                  selectedMark === kind
                    ? `option_${kind} selected`
                    : `option_${kind}`
                }
                key={kind}
                onClick={() => handleOnClick(spec)}
                css={markOptionCss}
              >
                <VegaLite
                  spec={spec as VisualizationSpec}
                  data={data}
                  actions={false}
                />
              </li>
            );
          })}
        {/* {results.map(({ choice: kind }) => {
          let shouldSkip = false;
          const spec = produce(props.spec, (draftSpec: GraphSpec) => {
            draftSpec['width'] = 100;
            draftSpec['height'] = 100;
            if (vegaCategoricalChartList.includes(kind)) {
              const x = draftSpec.encoding['x'];
              const y = draftSpec.encoding['y'];
              if (
                (x['type'] === 'quantitative' && y['type'] === 'nominal') ||
                (y['type'] === 'quantitative' && x['type'] === 'nominal')
              ) {
                if (kind === 'errorband') {
                  draftSpec.mark = { type: kind, extent: 'ci', borders: true };
                } else if (kind === 'errorbar') {
                  draftSpec.mark = { type: kind, extent: 'ci', ticks: true };
                } else if (kind === 'arc') {
                  if (x['type'] === 'quantitative') {
                    draftSpec['encoding']['theta'] = x;
                    draftSpec['encoding']['color'] = y;
                  } else {
                    draftSpec['encoding']['theta'] = y;
                    draftSpec['encoding']['color'] = x;
                  }
                } else if (kind === 'boxplot') {
                  draftSpec.mark = { type: kind, extent: 'min-max' };
                }
              } else {
                shouldSkip = true;
              }
            } else if (vegaTemporalChartList.includes(kind)) {
              const xType = draftSpec['encoding']['x']['type'];
              const yType = draftSpec['encoding']['y']['type'];
              if (
                ['temporal', 'ordinal'].includes(xType) &&
                yType === 'quantitative'
              ) {
                draftSpec.mark = kind;
              } else {
                shouldSkip = true;
              }
            } else {
              draftSpec.mark = kind;
            }
          });
          if (shouldSkip) {
            return null;
          }

          return (
            <li
              className={
                selectedMark === kind
                  ? `option_${kind} selected`
                  : `option_${kind}`
              }
              key={kind}
              onClick={() => handleOnClick(spec)}
              css={markOptionCss}
            >
              <VegaLite
                spec={spec as VisualizationSpec}
                data={data}
                actions={false}
              />
            </li>
          );
        })} */}
      </ul>
    </div>
  );
}
