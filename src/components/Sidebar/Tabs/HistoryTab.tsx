/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { useMemo } from 'react';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import SearchBar from '../../ui-widgets/SearchBar';

const historyCss = (theme: any) => css`
  .history-list {
    list-style: none;
    padding: 0;
    max-height: 160px;
    overflow-y: scroll;

    .history-el {
      padding: 10px;
      transition: background-color 0.5s;
      background-color: white;
      &:hover {
        background-color: whitesmoke;
      }

      &.active {
        border-left: 3px solid ${theme.color.primary[1]};
        font-weight: 700;
      }
    }
  }
`;

export default function HistoryTab() {
  const setSpec = useModelState<GraphSpec>('graph_spec')[1];
  const specHistory = useModelState<GraphSpec[]>('spec_history')[0];
  const [dfIndex, setDfIndex] = useModelState<number>(
    'current_dataframe_index'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setResults] = useState<string[]>([]);
  const histDescriptions = useMemo(
    () => generateDescriptions(specHistory),
    [specHistory]
  );

  function setHistoryPosition(index: number) {
    setDfIndex(index);
    setSpec(specHistory[index]);
  }

  return (
    <section className="HistoryTab" css={historyCss}>
      <h1>History Tab</h1>
      <input
        type="range"
        value={dfIndex}
        min={0}
        max={specHistory.length - 1}
        onChange={(e) => setHistoryPosition(e.target.valueAsNumber)}
      />

      <SearchBar
        choices={histDescriptions}
        value={searchQuery}
        onChange={setSearchQuery}
        onResultsChange={setResults}
      />
      <ul className="history-list">
        {searchResults.map((description, i) => {
          return (
            <li
              className={'history-el' + (i === dfIndex ? ' active' : '')}
              key={i}
              onClick={() => setHistoryPosition(i)}
            >
              {description}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function generateDescriptions(hist: GraphSpec[]) {
  return hist.map((spec) => {
    const field = {
      x: spec.encoding.x.field,
      y: spec.encoding.y.field,
    };
    const mark = spec.mark;
    return `${field.x} vs ${field.y} ${mark} chart`;
  });
}
