/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { StringExt } from '@lumino/algorithm';
import { useEffect } from 'react';
import { Search } from 'react-feather';
import React from 'react';

const searchBarCss = css`
  border: 1px solid #bdbdbd;
  /* background-color: #eee; */
  border-radius: 0 20px 20px 0px;
  width: 80%;
  height: 100%;
  margin: 0px;
  margin-left: 35px;
  border-left: none;
  padding: 0px;
`;

const searchIconCss = css`
  position: absolute;
  /* background-color: #eee; */
  width: 30px;
  height: 23px;
  border: 1px solid #bdbdbd;
  border-right: none;
  border-radius: 20px 0 0 20px;
  margin-left: 5px;
  padding-left: 5px;
`;

interface SearchProps {
  choices: string[];
  onResultsChange: (results: string[]) => void;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  placeholder?: string;
}

export default function SearchBar(props: SearchProps) {
  const ref = React.createRef<HTMLInputElement>();
  useEffect(() => {
    ref.current?.focus();
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
        return compScore(name) == undefined ? false : true;
      });

      // Ik the casting is bad but the filter above guarantees that these are numbers, so its valid practice.
      results.sort(
        (a, b) => (compScore(a) as number) - (compScore(b) as number)
      );
      props.onResultsChange(results);
    }
  }, [props.value]);

  return (
    <div className="searchBar" style={{ height: '23px' }}>
      <span css={searchIconCss}>
        <Search size={21} />
      </span>
      <input
        ref={ref}
        css={searchBarCss}
        type="search"
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={props.onKeyDown}
      />
    </div>
  );
}
