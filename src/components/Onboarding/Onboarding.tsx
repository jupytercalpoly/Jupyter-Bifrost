/**@jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState } from 'react';
import ColumnScreen from './ColumnScreen';
import EncodingScreen from './EncodingScreen';
import MarkScreen from './MarkScreen';
import { OnboardingScreenName } from './Screen';

const screenFlow = [ColumnScreen, EncodingScreen, MarkScreen];

const onboardingCss = css`
  min-height: 500px;
  width: 500px;
  max-width: 100%;
  border: 1px solid #ddd;
`;

export default function Onboarding() {
  const [screenIndex, setScreenIndex] = useState(OnboardingScreenName.Column);

  const Screen = screenFlow[screenIndex];
  return (
    <section className="Onboarding" css={onboardingCss}>
      <Screen
        stepNumber={screenIndex}
        onNext={() =>
          setScreenIndex((i) => (i < screenFlow.length - 1 ? ++i : i))
        }
        onBack={() => setScreenIndex((i) => (i > 0 ? --i : i))}
      />
    </section>
  );
}
