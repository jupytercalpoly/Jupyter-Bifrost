import React from 'react';
import { ScreenProps } from './Screen';
import OnboardingHeader from './OnboardingHeader';

export default function EncodingScreen(props: ScreenProps) {
  return (
    <article className="EncodingScreen">
      <OnboardingHeader
        title="How would you like to encode your chart?"
        onNext={props.onNext}
        onPrevious={props.onBack}
        stepNumber={props.stepNumber}
      ></OnboardingHeader>
    </article>
  );
}
