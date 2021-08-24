/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useMemo } from 'react';
import { useState } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { GraphSpec, useModelState } from '../../hooks/bifrost-model';
import { VegaEncoding } from '../../modules/VegaEncodings';
import { BifrostTheme } from '../../theme';
import ChartFilter from './ChartFilter';

const suggestedChartCss = (theme: BifrostTheme) => css`
  width: 100%;
  max-height: 400px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  overflow: hidden;
  .title {
    margin: 0;
  }

  .center-col {
    display: grid;
    height: 100%;
    button,
    ul {
      align-self: flex-start;
    }
  }

  .chart-col {
    position: relative;
    max-height: 100%;
    width: 100%;
    align-self: flex-start;
    overflow: hidden;
  }

  .suggested-charts {
    height: 315px;
    margin-left: 10px;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scroll-snap-align: center;
    overflow-x: scroll;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;

    @media screen and (max-width: 1200px) {
      max-height: 500px;
    }
  }

  .graph-wrapper {
    position: relative;
    margin: 40px 0;
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 5px;
    transition: border-color 0.5s;
    border: 10px solid transparent;
    transition: border-color 0.4s;
    flex: 0 0 auto;

    &:active {
      transform: scale(1);
    }

    &.focused,
    &:hover {
      border: 10px solid ${theme.color.primary.light};
    }
  }
`;

export default function ChartChooser(props: { onOnboarded: () => void }) {
  const [filteredMark, setFilteredMark] = useState('');
  const suggestedGraphs = useModelState('suggested_graphs')[0];
  const selectedColumns = useModelState('selected_columns')[0];
  const filteredGraphs = useMemo(
    () =>
      filteredMark
        ? suggestedGraphs.filter(
            (spec) => filteredMark === ((spec as GraphSpec).mark as string)
          )
        : suggestedGraphs,
    [filteredMark, suggestedGraphs]
  );

  const availableMarks = useMemo(
    () =>
      (suggestedGraphs as GraphSpec[]).reduce((markSet, { mark }) => {
        markSet.add(mark as string);
        return markSet;
      }, new Set<string>()),
    [suggestedGraphs]
  );
  const data = useModelState('graph_data')[0];
  const setGraphSpec = useModelState('graph_spec')[1];
  const setOpHistory = useModelState('spec_history')[1];
  const graphData = { data };

  function displayChart(selectedIndex: number) {
    if (selectedIndex === -1) {
      return;
    }

    const spec = produce(suggestedGraphs[selectedIndex] as GraphSpec, (gs) => {
      // Resize the spec to fit a single graph view
      gs.height = 420;
      gs.width = 550;
      gs.config = {
        mark: { tooltip: true },
      };
      gs.params = [{ name: 'brush', select: 'interval' }];
      const graphDescriptor = Object.values(gs.encoding)
        .map((info) => (info as GraphSpec['encoding'][VegaEncoding]).field)
        .join(' vs. ');
      gs.description = `Chose the ${graphDescriptor} ${gs.mark} plot`;
    });
    setGraphSpec(spec);
    setOpHistory([spec]);
    props.onOnboarded();
  }

  function selectChartWithSpaceBar(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (e.key !== ' ') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    displayChart(index);
  }

  return suggestedGraphs.length && selectedColumns.length ? (
    <section tabIndex={-1} className="ChartChooser" css={suggestedChartCss}>
      <ChartFilter
        filteredMark={filteredMark}
        availableMarks={availableMarks}
        onChange={setFilteredMark}
      />

      <div className="chart-col">
        {!!filteredGraphs.length && (
          <div style={{ paddingBottom: 10 }}>
            <h2 className="title">Recommended Charts</h2>
            <h3 className="subtitle">Select a chart to explore the dataset</h3>
          </div>
        )}
        <div className="suggested-charts">
          {filteredGraphs.map((spec, i) => (
            <button
              onClick={() => displayChart(i)}
              onKeyDown={(e) => selectChartWithSpaceBar(e, i)}
              style={{ scrollSnapAlign: 'center' }}
              className="graph-wrapper"
              key={i}
              data-focusable={'chart' + i}
            >
              <VegaLite
                spec={spec as VisualizationSpec}
                data={graphData}
                actions={false}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  ) : (
    <div></div>
  );
}
