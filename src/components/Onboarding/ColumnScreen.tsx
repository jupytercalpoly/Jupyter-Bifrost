/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState } from 'react';
import { ScreenProps } from './Screen';
import NavHeader from './NavHeader';
import SearchBar from '../SearchBar';
import {
  QuerySpec,
  GraphData,
  useModelState,
  SuggestedGraphs,
} from '../../hooks/bifrost-model';
import { build } from 'compassql/build/src/schema';
import { recommend } from 'compassql/build/src/recommend';
import { mapLeaves } from 'compassql/build/src/result';
import { SpecQueryModel } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';

// TODO: get this from the backend

const columnScreenCss = css`
  .choice {
    display: block;
    margin: 10px;
  }

  fieldset {
    border: none;
  }
`;

export default function ColumnScreen(props: ScreenProps) {
  const [query, setQuery] = useState('');
  const columnChoices = useModelState<string[]>('df_columns')[0];
  const spec = useModelState<QuerySpec>('query_spec')[0];
  const data = useModelState<GraphData>('graph_data')[0];
  const setSuggestedGraphs =
    useModelState<SuggestedGraphs>('suggested_graphs')[1];
  const [results, setResults] = useState(columnChoices);
  const [selectedColumns, setSelectedColumns] = useState(new Set());

  function submit() {
    console.log({ selectedColumns, spec });
    const opt = {};

    const schema = build(data, opt);
    const filteredEncodings = spec.spec.encodings.filter((encoding: any) =>
      selectedColumns.has(encoding.field)
    );
    const filteredSpecs: Query[] = [];
    for (let i = 0; i < filteredEncodings.length - 1; i++) {
      filteredSpecs.push({
        spec: { ...spec.spec, encodings: filteredEncodings.slice(i, i + 3) },
      });
    }

    console.log({ filteredSpecs });
    const items = filteredSpecs
      .map((spec) => recommend(spec, schema, opt).result)
      .map((res) =>
        mapLeaves(res, (item: SpecQueryModel) => {
          return item.toSpec();
        })
      )
      .map((leaves) => leaves.items)
      .flat();

    setSuggestedGraphs(items as SuggestedGraphs);
    props.onNext();
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updatedSet = new Set(selectedColumns);
    if (e.target.checked) {
      updatedSet.add(e.target.value);
    } else {
      updatedSet.delete(e.target.value);
    }
    setSelectedColumns(updatedSet);
  }

  return (
    <article className="ColumnScreen" css={columnScreenCss}>
      <NavHeader title="Select Columns" onNext={submit}>
        <SearchBar
          choices={columnChoices}
          value={query}
          onChange={setQuery}
          onResultsChange={setResults}
        />
      </NavHeader>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          {results.map((col) => (
            <label className="choice">
              <input
                type="checkbox"
                value={col}
                onChange={handleCheckboxChange}
              />{' '}
              {col}
            </label>
          ))}
        </fieldset>
      </form>
    </article>
  );
}
