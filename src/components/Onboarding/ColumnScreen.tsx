import React from 'react';
import { ScreenProps } from './Screen';
import { useModelState } from '../../hooks/bifrost-model';
import OnboardingHeader from './OnboardingHeader';

// TODO: get this from the backend
const columnChoices = ['foo', 'bar'];

export default function ColumnScreen(props: ScreenProps) {
  return (
    <article className="ColumnScreen">
      <OnboardingHeader onNext={props.onNext} onPrevious={props.onBack} />
      <form onSubmit={(e) => e.preventDefault()}></form>
    </article>
  );
}
