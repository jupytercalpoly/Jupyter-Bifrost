/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import ChartChooser from './ChartChooser';
import ColumnSelectorSidebar from './ColumnSelectorSidebar';

import { Args, useModelState } from '../../hooks/bifrost-model';
import { useKeyboardNavigation } from './KeyboardNav';
import { useEffect } from 'react';

interface OnboardingWidgetProps {
  onOnboarded: () => void;
  plotArgs: Args;
}

const onboardingWidgetCss = css`
  position: relative;
  display: flex;
  padding: 20px;
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
    setGraphConfig({ ...graphConfig, sample: true });
    return () => {
      setGraphConfig({ ...graphConfig, sample: false });
    };
  }, []);

  return (
    <article className="OnboardingWidget" css={onboardingWidgetCss} ref={ref}>
      <ColumnSelectorSidebar plotArgs={props.plotArgs} />
      <ChartChooser onOnboarded={props.onOnboarded} />
    </article>
  );
}
