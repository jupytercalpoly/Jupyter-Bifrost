/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import ChartChooser from './ChartChooser';
import ColumnSelectorSidebar from './ColumnSelectorSidebar';

import { Args, useModelState } from '../../hooks/bifrost-model';
import { useKeyboardNavigation } from './KeyboardNav';
import { useEffect } from 'react';
import produce from 'immer';

interface OnboardingWidgetProps {
  onOnboarded: () => void;
  plotArgs: Args;
}

const onboardingWidgetCss = css`
  position: relative;
  display: flex;
  padding: 20px;
  width: 100%;
  @media screen and (max-width: 1200px) {
    flex-direction: column;

    .ChartChooser {
      margin-top: 30px;
    }
  }
`;

export default function OnboardingWidget(props: OnboardingWidgetProps) {
  const ref = useKeyboardNavigation({
    jumpTo: { ArrowLeft: 'search', ArrowRight: 'chart0' },
  });

  const [graphConfig, setGraphConfig] = useModelState('graph_data_config');

  // Handle downsampling with multiple charts
  useEffect(() => {
    const sampleThreshold = graphConfig.sampleSize;
    const userDefinedSample = sampleThreshold !== 100;
    const defaultSingleGraphThreshold = Math.min(
      5000,
      graphConfig.datasetLength
    );
    setGraphConfig(
      produce(graphConfig, (gc) => {
        gc.sampleSize = 100;
      })
    );
    return () => {
      setTimeout(() => {
        setGraphConfig(
          produce(graphConfig, (gc) => {
            gc.sampleSize = userDefinedSample
              ? gc.sampleSize
              : defaultSingleGraphThreshold;
          })
        );
      }, 100);
    };
  }, []);

  return (
    <article className="OnboardingWidget" css={onboardingWidgetCss} ref={ref}>
      <ColumnSelectorSidebar plotArgs={props.plotArgs} />
      <ChartChooser onOnboarded={props.onOnboarded} />
    </article>
  );
}
