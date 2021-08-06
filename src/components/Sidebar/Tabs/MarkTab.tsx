/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';

import {
  vegaCategoricalChartList,
  vegaChartList,
  vegaTemporalChartList,
  preprocessEncoding,
  convertToCategoricalChartsEncoding,
} from '../../../modules/VegaEncodings';
import SearchBar from '../../ui-widgets/SearchBar';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import { VegaLite, VisualizationSpec } from 'react-vega';
import produce from 'immer';
import theme from '../../../theme';

const markOptionsListCss = css`
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  list-style: none;
  height: 380px;
  padding: 0px;
`;

const markOptionCss = css`
  display: flex;
  flex-direction: column;

  &.selected {
    border: 5px solid ${theme.color.primary.light};

    span {
      font-weight: bold;
    }
  }
`;

export default function MarkTab() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [spec, setSpec] = useModelState('graph_spec');
  const [results, setResults] = useState(
    vegaChartList.map((choice, index) => ({ choice, index }))
  );

  const graphData = useModelState('graph_data')[0];

  const data = { data: graphData };

  const [selectedMark, setSelectedMark] = useState<
    string | Record<string, any>
  >(spec.mark);

  function handleOnClick(spec: GraphSpec) {
    const mark = typeof spec.mark === 'object' ? spec.mark.type : spec.mark;
    if (mark === selectedMark) {
      return;
    }
    const newSpec = produce(spec, (draftSpec: GraphSpec) => {
      draftSpec['width'] = spec.width;
      draftSpec['height'] = spec.height;

      if (draftSpec.mark === 'bar') {
        draftSpec.params[0].select = { type: 'interval', encodings: ['x'] };
      } else {
        draftSpec.params[0].select = 'interval';
      }
    });
    setSelectedMark(mark);
    setSpec(newSpec);
  }

  return (
    <div className="mark-sub-tab" style={{ height: '100%', width: '100%' }}>
      <SearchBar
        choices={vegaChartList}
        onResultsChange={setResults}
        onChange={setSearchValue}
        value={searchValue}
      />
      <ul className="mark-options" css={markOptionsListCss}>
        {results
          .filter(({ choice: kind }) => {
            const channels = Object.keys(spec.encoding);
            if (
              channels.length === 0 ||
              (!('x' in spec.encoding) && !('y' in spec.encoding))
            ) {
              return false;
            }

            if (
              ('x' in spec.encoding && !('y' in spec.encoding)) ||
              ('y' in spec.encoding && !('x' in spec.encoding))
            ) {
              return !(kind === 'arc');
            }

            const graphSpec = produce(spec, (draftSpec: GraphSpec) => {
              preprocessEncoding(draftSpec);
            });

            if (vegaCategoricalChartList.includes(kind)) {
              const x = graphSpec['encoding']['x'];
              const y = graphSpec['encoding']['y'];
              return (
                (x['type'] === 'quantitative' && y['type'] === 'nominal') ||
                (y['type'] === 'quantitative' && x['type'] === 'nominal')
              );
            } else if (vegaTemporalChartList.includes(kind)) {
              const xType = graphSpec['encoding']['x']['type'];
              const yType = graphSpec['encoding']['y']['type'];

              return (
                ['temporal', 'ordinal'].includes(xType) &&
                yType === 'quantitative'
              );
            } else {
              return true;
            }
          })
          .map(({ choice: kind }) => {
            const graphSpec = produce(spec, (draftSpec: GraphSpec) => {
              draftSpec['width'] = 100;
              draftSpec['height'] = 100;
              draftSpec.mark = kind;

              preprocessEncoding(draftSpec);

              if (vegaCategoricalChartList.includes(kind)) {
                convertToCategoricalChartsEncoding(draftSpec, kind);
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
                onClick={() => handleOnClick(graphSpec)}
                css={markOptionCss}
              >
                <VegaLite
                  spec={graphSpec as VisualizationSpec}
                  data={data}
                  actions={false}
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
}
