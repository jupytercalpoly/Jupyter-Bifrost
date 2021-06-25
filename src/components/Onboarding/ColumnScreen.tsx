/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState } from 'react';
import { ScreenProps } from './Screen';
import OnboardingHeader from './OnboardingHeader';
import SearchBar from '../SearchBar';

// TODO: get this from the backend
const columnChoices = ['foo', 'bar'];

const columnScreenCss = css`
  .choice {
    display: block;
    margin: 10px;
  }
`;

export default function ColumnScreen(props: ScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(columnChoices);
  const [selectedColumns, setSelectedColumns] = useState(new Set());

  function submit() {
    console.log(selectedColumns);
    props.onNext();
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e);
    setSelectedColumns((s) => new Set(s));
  }

  return (
    <article className="ColumnScreen" css={columnScreenCss}>
      <OnboardingHeader
        title="What columns from your dataset do you want to use?"
        onNext={submit}
        onPrevious={props.onBack}
        stepNumber={props.stepNumber}
      >
        <SearchBar
          choices={columnChoices}
          value={query}
          onChange={setQuery}
          onResultsChange={setResults}
        />
      </OnboardingHeader>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          {results.map((col) => (
            <label className="choice">
              {col}:{' '}
              <input
                type="checkbox"
                value={col}
                onChange={handleCheckboxChange}
              />
            </label>
          ))}
        </fieldset>
      </form>
    </article>
  );
}
