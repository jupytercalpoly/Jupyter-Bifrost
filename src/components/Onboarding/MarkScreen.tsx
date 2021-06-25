import React from 'react';
import { ScreenProps } from './Screen';
import OnboardingHeader from './OnboardingHeader';

export default function MarkScreen(props: ScreenProps) {
  return (
    <article className="MarkScreen">
      <OnboardingHeader
        title="What kind of marks would you like to use?"
        onNext={props.onNext}
        onPrevious={props.onBack}
        stepNumber={props.stepNumber}
      ></OnboardingHeader>
    </article>
  );
}
