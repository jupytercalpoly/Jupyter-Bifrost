/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState, useRef } from 'react';
import NavHeader from './NavHeader';
import SearchBar from '../ui-widgets/SearchBar';
// import Tag from '../ui-widgets/Tag';
import Pill from '../ui-widgets/Pill';

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
import { X } from 'react-feather';
import { useEffect } from 'react';

// TODO: get this from the backend

const columnScreenCss = css`
  display: flex;

  .choice {
    display: flex;
    margin: 10px;
    margin-left: 40px;
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
    /* height: 23px;
    width: fit-content; */
    white-space: nowrap;
    overflow: hidden;
    align-items: center;
  }

  .tag-content-wrapper button {
    border: none;
    width: 15px;
    background-color: #dedede;
    color: var(--jp-widgets-color);
    border-radius: 50%;
    cursor: pointer;
    padding: 0px;
  }

  .tag-content-wrapper button:hover {
    background-color: #eee;
  }
`;

interface ColumnScreenProps {
  onNext: () => void;
  onBack?: () => void;
  preSelectedColumns: Set<string>;
}

export default function ColumnScreen(props: ColumnScreenProps) {
  const [query, setQuery] = useState('');
  const columnChoices = useModelState<string[]>('df_columns')[0];
  const spec = useModelState<QuerySpec>('query_spec')[0];
  const data = useModelState<GraphData>('graph_data')[0];
  const setSuggestedGraphs =
    useModelState<SuggestedGraphs>('suggested_graphs')[1];
  const [results, setResults] = useState(
    columnChoices.map((choice, index) => ({ choice, index }))
  );
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  const [selectedColumns, setSelectedColumns] = useState(
    props.preSelectedColumns
  );
  const keyPressed = { Shift: false, Enter: false };

  useEffect(() => {
    searchRef.current?.focus();
    if (results.length !== 0) {
      setFocusedIdx(0);
    }
  }, [results]);

  function submit() {
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

    const items = filteredSpecs
      .map((spec) => recommend(spec, schema, opt).result)
      .map((res) =>
        mapLeaves(res, (item: SpecQueryModel) => {
          const newSpec: Record<string, any> = item.toSpec();
          newSpec['params'] = (spec.spec as Record<string, any>)['params'];
          return newSpec;
        })
      )
      .map((leaves) => leaves.items)
      .flat();

    if (!items.length) {
      return;
    }

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

    setSelectedColumns(updatedSet);
  }

  function handleKeydown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();

        if (keyPressed['Shift']) {
          keyPressed['Enter'] = true;
          submit();
        } else {
          if (columnChoices.includes(query)) {
            const updatedSet = new Set(selectedColumns);
            updatedSet.add(query);
            setSelectedColumns(updatedSet);
          } else {
            const choice = optionsRef.current?.querySelector(
              '.choice.focused input'
            ) as HTMLInputElement;

            if (choice) {
              const updatedSet = new Set(selectedColumns);
              updatedSet.add(choice.value);
              setSelectedColumns(updatedSet);
            }
          }
        }
        break;
      case 'Backspace':
        if (query.length === 0) {
          e.preventDefault();
          e.stopPropagation();

          const tags = document.querySelectorAll('.content-wrapper');
          if (tags.length !== 0) {
            const updatedSet = new Set(selectedColumns);
            const tagName = (
              tags[tags.length - 1].getElementsByTagName(
                'span'
              )[0] as HTMLSpanElement
            ).textContent;

            tagName && updatedSet.delete(tagName);
            setSelectedColumns(updatedSet);
          }
        }
        break;
      case 'Shift':
        e.preventDefault();
        e.stopPropagation();
        keyPressed['Shift'] = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (focusedIdx < results.length - 1) {
          setFocusedIdx(focusedIdx + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();

        if (focusedIdx > 0) {
          setFocusedIdx(focusedIdx - 1);
        }
        break;
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLElement>) {
    switch (e.key) {
      case 'Shift':
        keyPressed['Shift'] = false;
        keyPressed['Enter'] = false;
        break;
    }
  }

  return (
    <article
      className="ColumnScreen"
      css={columnScreenCss}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeydown}
    >
      <section className="searchColumns">
        <NavHeader title="Select Columns" onNext={submit}>
          <SearchBar
            choices={columnChoices}
            value={query}
            onChange={setQuery}
            onResultsChange={setResults}
            forwardedRef={searchRef}
          />
        </NavHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset ref={optionsRef}>
            {results.map(({ choice: col }, i) => {
              return (
                <label
                  className={i === focusedIdx ? 'choice focused' : 'choice'}
                  key={col}
                >
                  <input
                    className={`choice_${col}`}
                    type="checkbox"
                    value={col}
                    onChange={handleCheckboxChange}
                    checked={selectedColumns.has(col)}
                  />{' '}
                  {col}
                </label>
              );
            })}
          </fieldset>
        </form>
      </section>
      <section
        className="column-tags-wrapper"
        style={{ marginTop: '42px', width: '400px' }}
      >
        <ul className="column-tags">
          {Array.from(selectedColumns).map((column: string) => {
            return (
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
            );
          })}
        </ul>
      </section>
    </article>
  );
}
