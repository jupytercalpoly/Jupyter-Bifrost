import React from 'react';
import { OnboardingScreenProps } from './OnboardingScreen';
import NavHeader from './NavHeader';

export default function EncodingScreen(props: OnboardingScreenProps) {
  return (
    <article className="EncodingScreen">
      <NavHeader
        title="How would you like to encode your chart?"
        onNext={props.onNext}
        onPrevious={props.onBack}
      ></NavHeader>
    </article>
  );
}
