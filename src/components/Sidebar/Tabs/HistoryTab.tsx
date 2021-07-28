/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import SearchBar from '../../ui-widgets/SearchBar';

const historyCss = (theme: any) => css`
  height: 100%;
  .history-list {
    list-style: none;
    padding: 0;
    max-height: 300px;
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
  const [spec, setSpec] = useModelState('graph_spec');
  const [specHistory] = useModelState('spec_history');

  const [dfIndex, setDfIndex] = useModelState('current_dataframe_index');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setResults] = useState<
    { choice: string; index: number }[]
  >([]);
  const reverseHistory = useMemo(
    () => [...specHistory].reverse(),
    [specHistory]
  );
  const histDescriptions = useMemo(
    () => generateDescriptions(reverseHistory),
    [reverseHistory]
  );

  // Select the last valid spec if current spec has no encoding
  useEffect(() => {
    const hasNoEncodings = !Object.keys(spec.encoding).length;
    if (hasNoEncodings) {
      const lastValidSpec = produce(
        specHistory[specHistory.length - 1],
        (gs) => gs
      );
      setSpec(lastValidSpec);
    }
  }, []);

  function invertHistIndex(i: number) {
    return specHistory.length - 1 - i;
  }

  function setHistoryPosition(index: number) {
    setDfIndex(invertHistIndex(index));
    setSpec(reverseHistory[index]);
  }

  return (
    <section className="HistoryTab" css={historyCss}>
      <SearchBar
        choices={histDescriptions}
        value={searchQuery}
        onChange={setSearchQuery}
        onResultsChange={setResults}
      />
      <ul className="history-list">
        {searchResults.map(({ choice, index }, elIndex) => {
          const classes = [
            ['history-el', true],
            ['active', index === invertHistIndex(dfIndex)],
          ]
            .filter((pair) => pair[1])
            .map((pair) => pair[0])
            .join(' ');

          return (
            <li
              className={classes}
              key={index}
              onClick={() => setHistoryPosition(index)}
            >
              {choice}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function generateDescriptions(hist: GraphSpec[]) {
  return hist.map((spec) => {
    const fieldString = Object.values(spec.encoding)
      .map((info) => info.field)
      .join(' vs ');
    const mark = spec.mark;
    return `${fieldString} ${mark} chart`;
  });
}
