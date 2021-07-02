/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import React, { useState } from 'react';
import NavHeader from './NavHeader';
import SearchBar from '../ui-widgets/SearchBar';
import Tag from '../ui-widgets/Tag';

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
    margin-left: 40px;
    width: fit-content;
    input[type='checkbox']:focus {
      outline: #771c79 solid 2px;
    }

    input[type='checkbox']:checked {
      /* outline: none; */
      background-color: #771c79;
    }
  }

  fieldset {
    border: none;
  }

  .column-tags {
    padding: 0px;
    display: flex;
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
  const [results, setResults] = useState(columnChoices);

  const [selectedColumns, setSelectedColumns] = useState(
    props.preSelectedColumns
  );
  const keyPressed = { Shift: false, Enter: false };

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

    console.log({ filteredSpecs });
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
    const selectedTag = (e.target as HTMLButtonElement).className.split('_')[1];

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
          console.log(selectedColumns);
          submit();
        } else {
          if (columnChoices.includes(query)) {
            const updatedSet = new Set(selectedColumns);
            updatedSet.add(query);
            setSelectedColumns(updatedSet);
          } else {
            if (query.length != 0) {
              const choice = document.querySelectorAll(
                '.choice input'
              )[0] as HTMLInputElement;

              if (choice) {
                const updatedSet = new Set(selectedColumns);
                updatedSet.add(choice.value);
                setSelectedColumns(updatedSet);
              }
            }
          }
        }
        break;
      case 'Backspace':
        if (query.length == 0) {
          e.preventDefault();
          e.stopPropagation();

          const tags = document.querySelectorAll('.column-tag');
          if (tags.length != 0) {
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
        break;
      case 'ArrowUp':
        break;
      case 'Tab':
        console.log('tab');
        e.preventDefault();
        e.stopPropagation();
        const choice = document.querySelectorAll(
          '.choice input'
        )[0] as HTMLInputElement;
        console.log(choice);
        choice.focus();
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
      <NavHeader title="Select Columns" onNext={submit}>
        <ul className="column-tags">
          {Array.from(selectedColumns).map((column: string) => {
            return (
              <Tag key={`tag_${column}`}>
                <div className="tag-wrapper">
                  <span style={{ padding: '0px 5px' }}>{column}</span>
                  <button
                    className={`tagButton_${column}`}
                    onClick={handleDelete}
                  >
                    X
                  </button>
                </div>
              </Tag>
            );
          })}
        </ul>
        <SearchBar
          choices={columnChoices}
          value={query}
          onChange={setQuery}
          onResultsChange={setResults}
        />
      </NavHeader>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          {results.map((col) => {
            if (selectedColumns.has(col)) {
              return (
                <label className="choice" key={col}>
                  <input
                    className={`choice_${col}`}
                    type="checkbox"
                    value={col}
                    onChange={handleCheckboxChange}
                    checked
                  />{' '}
                  {col}
                </label>
              );
            } else {
              return (
                <label className="choice" key={col}>
                  <input
                    className={`choice_${col}`}
                    type="checkbox"
                    value={col}
                    onChange={handleCheckboxChange}
                    checked={false}
                  />{' '}
                  {col}
                </label>
              );
            }
          })}
        </fieldset>
      </form>
    </article>
  );
}
