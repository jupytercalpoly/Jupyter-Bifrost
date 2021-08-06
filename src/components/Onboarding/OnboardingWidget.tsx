/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import ChartChooser from './ChartChooser';
import ColumnSelectorSidebar from './ColumnSelectorSidebar';

import { Args } from '../../hooks/bifrost-model';
import { useKeyboardNavigation } from './KeyboardNav';

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

  return (
    <article className="OnboardingWidget" css={onboardingWidgetCss} ref={ref}>
      <ColumnSelectorSidebar plotArgs={props.plotArgs} />
      <ChartChooser onOnboarded={props.onOnboarded} />
    </article>
  );
}
