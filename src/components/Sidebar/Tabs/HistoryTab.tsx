/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { useEffect, useState } from 'react';
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

      &.temporary {
        color: gray;
      }
    }
  }
`;

export default function HistoryTab() {
  const [spec, setSpec] = useModelState('graph_spec');
  const [specHistory, setSpecHistory] = useModelState('spec_history');
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

  useEffect(() => {
    const updatedHist = specHistory.slice(0, dfIndex + 1);
    updatedHist.push(spec);
    setSpecHistory(updatedHist);
    setDfIndex(updatedHist.length - 1);

    return () => {
      setSpecHistory(updatedHist.slice(0, updatedHist.length - 1));
      if (dfIndex > updatedHist.length - 2) {
        setDfIndex(updatedHist.length - 2);
      }
    };
  }, []);

  /**
   * Preserves the spec state when the user navigates to the history tab
   * and deletes the temporarily saved spec when the user navigates away.
   */

  function invertHistIndex(i: number) {
    return specHistory.length - 1 - i;
  }

  function setHistoryPosition(index: number) {
    setDfIndex(invertHistIndex(index));
    setSpec(reverseHistory[index]);
  }

  return (
    <section className="HistoryTab" css={historyCss}>
      <h1>History Tab</h1>
      <input
        type="range"
        value={dfIndex}
        min={0}
        max={specHistory.length - 1}
        onChange={(e) =>
          setHistoryPosition(invertHistIndex(e.target.valueAsNumber))
        }
      />

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
            ['temporary', index === 0],
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
              {(index === 0 ? '(Unsaved) ' : '') + choice}
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
