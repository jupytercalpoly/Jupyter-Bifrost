/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { StringExt } from '@lumino/algorithm';
import { useEffect } from 'react';

const searchBarCss = css`
  border: 1px solid #bdbdbd;
  background-color: #eee;
  border-radius: 20px;
  width: 100%;
`;

interface SearchProps {
  choices: string[];
  onResultsChange: (results: string[]) => void;
  onChange: (value: string) => void;
  value: string;
}

export default function SearchBar(props: SearchProps) {
  useEffect(() => {
    const notAlpha = /[^A-Za-z]/g;
    const normQuery = props.value.replace(notAlpha, '').toLowerCase();
    const compScore = (name: string) =>
      StringExt.matchSumOfSquares(
        name.replace(notAlpha, '').toLowerCase(),
        normQuery
      )?.score;
    if (props.value.length === 0) {
      props.onResultsChange(props.choices);
    } else {
      const results = props.choices.filter((name) => {
        return compScore(name) ?? false;
      });
      // Ik the casting is bad but the filter above guarantees that these are numbers, so its valid practice.
      results.sort(
        (a, b) => (compScore(a) as number) - (compScore(b) as number)
      );
      props.onResultsChange(results);
    }
  }, [props.value]);

  return (
    <input
      css={searchBarCss}
      type="search"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}
