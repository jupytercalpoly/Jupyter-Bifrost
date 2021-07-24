/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import ChartChooser from './ChartChooser';
import ColumnSelectorSidebar from './ColumnSelectorSidebar';

import { Args } from '../../hooks/bifrost-model';

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
  }
`;

export default function OnboardingWidget(props: OnboardingWidgetProps) {
  return (
    <article className="OnboardingWidget" css={onboardingWidgetCss}>
      <ColumnSelectorSidebar plotArgs={props.plotArgs} />
      <ChartChooser onOnboarded={props.onOnboarded} />
    </article>
  );
}
