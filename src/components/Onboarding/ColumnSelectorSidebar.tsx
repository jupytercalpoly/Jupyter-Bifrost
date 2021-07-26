/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState, useRef } from 'react';
import SearchBar from '../ui-widgets/SearchBar';

import { build } from 'compassql/build/src/schema';
import { recommend } from 'compassql/build/src/recommend';
import { mapLeaves } from 'compassql/build/src/result';
import { SpecQueryModel } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';
import { Lock, X } from 'react-feather';
import { useEffect } from 'react';
import { EncodingQuery } from 'compassql/build/src/query/encoding';
import { Focusable } from './KeyboardNav';

import {
  useModelState,
  SuggestedGraphs,
  Args,
} from '../../hooks/bifrost-model';
import Pill from '../ui-widgets/Pill';
import { useMemo } from 'react';

const columnSelectorCss = css`
  width: 320px;
  margin-right: 30px;

  h1,
  h2 {
    margin: 0;
  }

  .subtitle {
    font-size: 18px;
    color: gray;
    font-weight: 700;
  }

  .choice {
    display: flex;
    margin: 10px;
    width: fit-content;

    &.focused {
      background-color: #dedede;
    }
  }

  input[type='checkbox'] {
    all: unset;
    width: 13px;
    height: 13px;
    display: inline-block;
    cursor: pointer;
    border: 1px solid #aaa;
    border-radius: 20%;
    margin-right: 6px;
  }

  input[type='checkbox']:disabled {
    cursor: default;
  }

  input[type='checkbox']:checked {
    background: #771c79;
  }

  input[type='checkbox']:checked::after {
    position: absolute;
    color: white;
    content: '✓';
    padding-left: 1px;
    line-height: 1;
  }

  input[type='checkbox']:focus-visible {
    outline: auto;
  }

  fieldset {
    border: none;
  }

  .column-tags {
    padding: 0px;
    display: flex;
    flex-wrap: wrap;
  }

  .tag-content-wrapper {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
    overflow: hidden;
    align-items: center;
  }

  .tag-content-wrapper button {
    border: none;
    width: 20px;
    height: 20px;
    background-color: #dedede;
    color: var(--jp-widgets-color);
    border-radius: 50%;
    cursor: pointer;
    padding: 0px;
    margin: 0;
  }

  .tag-content-wrapper button:hover {
    background-color: #eee;
  }
`;
export default function ColumnSelectorSidebar(props: { plotArgs: Args }) {
  const [query, setQuery] = useState('');
  const columnChoices = useModelState('df_columns')[0];
  const [selectedColumns, setSelectedColumns] =
    useModelState('selected_columns');
  const columnTypes = useModelState('column_types')[0];
  const spec = useModelState('query_spec')[0];
  const data = useModelState('graph_data')[0];
  const setSuggestedGraphs = useModelState('suggested_graphs')[1];

  const [results, setResults] = useState(
    columnChoices.map((choice, index) => ({ choice, index }))
  );
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const preSelectedColumns = useMemo(
    () => new Set(Object.values(props.plotArgs).filter(Boolean)),
    [props.plotArgs]
  );

  // Ensure that pre-selected columns are included on initial render.
  useEffect(() => {
    if (selectedColumns.length) {
      return;
    }
    setSelectedColumns(Array.from(preSelectedColumns));
  }, []);

  // Focus the search field
  useEffect(() => {
    searchRef.current?.focus();
    if (results.length !== 0) {
      setFocusedIdx(0);
    }
  }, [results]);

  // Create charts whenever the column selection changes
  useEffect(createChartsFromColumns, [selectedColumns]);

  function createChartsFromColumns() {
    const opt = {};
    const schema = build(data, opt);

    const selectedEncodings = Array.from(selectedColumns).map((column) => {
      if (preSelectedColumns.has(column)) {
        return spec.spec.encodings.filter(
          (encoding: any) => encoding['field'] === column
        )[0];
      }
      return {
        field: column,
        type: columnTypes[column],
        channel: '?',
      } as EncodingQuery;
    });

    const preRecommendedSpecs: Query[] = [];
    if (selectedEncodings.length > 3) {
      const fixedEncoding = selectedEncodings.filter(
        (encoding) => encoding.channel !== '?'
      );
      const nonFixedEncoding = selectedEncodings.filter(
        (encoding) => encoding.channel === '?'
      );

      for (let i = 0; i < nonFixedEncoding.length - 1; i++) {
        const encodings = [
          ...fixedEncoding,
          ...nonFixedEncoding.slice(i, i + 2),
        ];
        preRecommendedSpecs.push({
          spec: { ...spec.spec, encodings: encodings },
        });
      }
    } else {
      preRecommendedSpecs.push({
        spec: { ...spec.spec, encodings: selectedEncodings },
      });
    }

    const recommendedSpecs = preRecommendedSpecs
      .map((spec) => recommend(spec, schema, opt).result)
      .map((res) =>
        mapLeaves(res, (item: SpecQueryModel) => {
          const newSpec: Record<string, any> = item.toSpec();
          newSpec['params'] = (spec.spec as Record<string, any>)['params'];
          return newSpec;
        })
      )
      .map((leaves) => leaves.items)
      .flat()
      .filter((spec) => Object.keys((spec as any).encoding).length);

    setSuggestedGraphs(recommendedSpecs as SuggestedGraphs);
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updatedSet = new Set(selectedColumns);
    if (e.target.checked) {
      updatedSet.add(e.target.value);
    } else {
      updatedSet.delete(e.target.value);
    }
    setSelectedColumns(Array.from(updatedSet));
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const updatedSet = new Set(selectedColumns);
    const selectedTag = (e.currentTarget as HTMLButtonElement).className.split(
      '_'
    )[1];

    updatedSet.delete(selectedTag);

    const choice = document.getElementsByClassName(
      `choice_${selectedTag}`
    )[0] as HTMLInputElement;
    choice.checked = false;

    setSelectedColumns(Array.from(updatedSet));
  }

  return (
    <aside className="ColumnSelectorSidebar" css={columnSelectorCss}>
      <h1>Chart Browser</h1>
      <h2 className="subtitle">Select up to 3 columns</h2>
      <ul className="column-tags">
        {Array.from(selectedColumns).map((column: string) => {
          return (
            <Focusable id="test" parentId="default">
              <Pill key={`tag_${column}`}>
                <div className="tag-content-wrapper">
                  <span style={{ padding: '0px 5px' }}>{column}</span>
                  <button
                    className={`tagButton_${column}`}
                    onClick={handleDelete}
                  >
                    <X size={10} />
                  </button>
                </div>
              </Pill>
            </Focusable>
          );
        })}
      </ul>
      <SearchBar
        choices={columnChoices}
        value={query}
        onChange={setQuery}
        onResultsChange={setResults}
        forwardedRef={searchRef}
      />
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset ref={optionsRef}>
          {results.map(({ choice: col }, i) => {
            return (
              <label
                className={i === focusedIdx ? 'choice focused' : 'choice'}
                key={col}
              >
                {preSelectedColumns.has(col) ? (
                  <Lock size={15} style={{ marginRight: '6px' }} />
                ) : (
                  <input
                    className={`choice_${col}`}
                    type="checkbox"
                    value={col}
                    onChange={handleCheckboxChange}
                    checked={selectedColumns.includes(col)}
                  />
                )}
                {col}
              </label>
            );
          })}
        </fieldset>
      </form>
    </aside>
  );
}
