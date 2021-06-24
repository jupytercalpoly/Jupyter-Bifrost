import React, { useState } from 'react';
import ColumnScreen from './ColumnScreen';
import EncodingScreen from './EncodingScreen';
import MarkScreen from './MarkScreen';
import { OnboardingScreenName, ScreenProps } from './Screen';

type ScreenMap = {
  [name in OnboardingScreenName]: (props: ScreenProps) => JSX.Element;
};

const screenMapping: ScreenMap = {
  [OnboardingScreenName.Column]: ColumnScreen,
  [OnboardingScreenName.Mark]: MarkScreen,
  [OnboardingScreenName.Encoding]: EncodingScreen,
};

export default function Onboarding() {
  const [screenName, setScreenName] = useState(OnboardingScreenName.Column);

  const Screen = screenMapping[screenName];
  return (
    <section className="Onboarding">
      <Screen onNavigation={setScreenName} />
    </section>
  );
}
