import React from 'react';
import { ScreenProps } from './Screen';
import NavHeader from './NavHeader';

export default function EncodingScreen(props: ScreenProps) {
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
