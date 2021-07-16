/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';

import {
  vegaCategoricalChartList,
  vegaChartList,
  vegaTemporalChartList,
  preprocessEncoding,
  convertToCategoricalChartsEncoding,
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
    border: 5px solid ${theme.color.primary.light};

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

    if (typeof newSpec.mark === 'object') {
      setSelectedMark(newSpec.mark.type);
    } else {
      setSelectedMark(newSpec.mark);
    }
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
            const channels = Object.keys(props.spec.encoding);
            if (channels.length === 0) {
              return false;
            }

            if (
              ('x' in props.spec.encoding && !('y' in props.spec.encoding)) ||
              ('y' in props.spec.encoding && !('x' in props.spec.encoding))
            ) {
              return !(kind === 'arc');
            }

            if (
              !('x' in props.spec.encoding) &&
              !('y' in props.spec.encoding)
            ) {
              return false;
            }

            const spec = produce(props.spec, (draftSpec: GraphSpec) => {
              preprocessEncoding(draftSpec);
            });

            if (vegaCategoricalChartList.includes(kind)) {
              const x = spec['encoding']['x'];
              const y = spec['encoding']['y'];
              return (
                (x['type'] === 'quantitative' && y['type'] === 'nominal') ||
                (y['type'] === 'quantitative' && x['type'] === 'nominal')
              );
            } else if (vegaTemporalChartList.includes(kind)) {
              const xType = spec['encoding']['x']['type'];
              const yType = spec['encoding']['y']['type'];

              return (
                ['temporal', 'ordinal'].includes(xType) &&
                yType === 'quantitative'
              );
            } else {
              return true;
            }
          })
          .map(({ choice: kind }) => {
            const spec = produce(props.spec, (draftSpec: GraphSpec) => {
              draftSpec['width'] = 100;
              draftSpec['height'] = 100;
              draftSpec.mark = kind;

              preprocessEncoding(draftSpec);

              if (vegaCategoricalChartList.includes(kind)) {
                convertToCategoricalChartsEncoding(draftSpec, kind);
              }
            });
            console.log(spec);
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
      </ul>
    </div>
  );
}
