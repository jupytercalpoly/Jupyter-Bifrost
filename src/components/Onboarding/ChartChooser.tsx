/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useMemo } from 'react';
import { useEffect, useRef, useState } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { GraphSpec, useModelState } from '../../hooks/bifrost-model';
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

  .suggested-charts {
    height: 100%;
    padding: 100px 0;
    margin-left: 10px;
    scroll-behavior: smooth;
    scroll-snap-type: y mandatory;
    scroll-snap-align: center;

    overflow: scroll;

    @media screen and (max-width: 1200px) {
      max-height: 500px;
    }
  }

  .graph-wrapper {
    position: relative;
    margin: 40px 0;
    border-radius: 5px;
    transition: border-color 0.5s;
    border: 10px solid transparent;

    &::after {
      transform: translateX(10px);
      opacity: 0;
      transition: opacity 0.5s, transform 0.5s;
    }

    &:hover::after {
      content: 'Double Click to Explore';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 150px;
      background-color: #ffffffc5;
      padding: 2px;
      transform: translateX(0px);
      opacity: 1;
    }

    &.selected {
      border: 10px solid ${theme.color.primary.light};
    }
  }
`;

const defaultMarks = new Set(['point', 'bar', 'arc', 'line']);

export default function ChartChooser(props: { onOnboarded: () => void }) {
  const [activeMarks, setActiveMarks] = useState(defaultMarks);
  const suggestedGraphs = useModelState('suggested_graphs')[0];
  const filteredGraphs = useMemo(
    () =>
      suggestedGraphs.filter((spec) =>
        activeMarks.has((spec as GraphSpec).mark as string)
      ),
    [activeMarks, suggestedGraphs]
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const chartChooserRef = useRef<HTMLElement>(null);

  useEffect(() => {
    chartChooserRef.current?.focus();
  }, []);

  function displayChart() {
    if (selectedIndex === -1) {
      return;
    }

    const spec = produce(suggestedGraphs[selectedIndex] as GraphSpec, (gs) => {
      // Resize the spec to fit a single graph view
      gs.height = 405;
      gs.width = 550;
      gs.config = {
        mark: { tooltip: true },
      };
      gs.params = [{ name: 'brush', select: 'interval' }];
    });
    setGraphSpec(spec);
    setOpHistory([spec]);
    props.onOnboarded();
  }

  return suggestedGraphs.length ? (
    <section
      tabIndex={-1}
      className="ChartChooser"
      css={suggestedChartCss}
      ref={chartChooserRef}
    >
      <ChartFilter
        activeMarks={activeMarks}
        availableMarks={availableMarks}
        onChange={setActiveMarks}
      />
      <div className="suggested-charts">
        {filteredGraphs.map((spec, i) => (
          <div
            onDoubleClick={displayChart}
            style={{ scrollSnapAlign: 'center' }}
            className={
              selectedIndex === i ? 'graph-wrapper selected' : 'graph-wrapper'
            }
            key={i}
          >
            <div onClick={() => setSelectedIndex(i)}>
              <VegaLite
                spec={spec as VisualizationSpec}
                data={graphData}
                actions={false}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  ) : (
    <div></div>
  );
}
