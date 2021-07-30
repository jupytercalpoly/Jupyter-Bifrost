/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { StringExt } from '@lumino/algorithm';
import { useEffect } from 'react';
import { Search } from 'react-feather';
import React from 'react';

const searchBarCss = css`
  height: 23px;
  margin-top: 10px;
  input {
    border: 1px solid #bdbdbd;
    border-radius: 0 20px 20px 0px;
    width: 80%;
    height: 100%;
    margin: 0px;
    margin-left: 35px;
    border-left: none;
    padding: 15px;
    padding-left: 5px;
  }
`;

const searchIconCss = css`
  position: absolute;
  display: grid;
  place-items: center;
  /* background-color: #eee; */
  width: 30px;
  height: 32px;
  border: 1px solid #bdbdbd;
  border-right: none;
  border-radius: 20px 0 0 20px;
  margin-left: 5px;
  padding-left: 5px;
`;

export interface SearchProps {
  choices: string[];
  onResultsChange: (results: { choice: string; index: number }[]) => void;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  placeholder?: string;
  forwardedRef?: React.ForwardedRef<HTMLInputElement>;
  [other: string]: any;
}

export default function SearchBar(props: SearchProps) {
  const {
    choices,
    onResultsChange,
    onChange,
    onKeyDown,
    value,
    placeholder,
    forwardedRef,
    ...rest
  } = props;
  useEffect(() => {
    const notAlpha = /[^A-Za-z]/g;
    const normQuery = value.replace(notAlpha, '').toLowerCase();
    const compScore = (name: string) =>
      StringExt.matchSumOfSquares(
        name.replace(notAlpha, '').toLowerCase(),
        normQuery
      )?.score;

    const indexedChoices = choices.map((choice, index) => ({
      choice,
      index,
    }));
    if (value.length === 0) {
      onResultsChange(indexedChoices);
    } else {
      const results = indexedChoices.filter(({ choice }) => {
        return compScore(choice) === undefined ? false : true;
      });

      // Ik the casting is bad but the filter above guarantees that these are numbers, so its valid practice.
      results.sort(
        (a, b) =>
          (compScore(a.choice) as number) - (compScore(b.choice) as number)
      );
      onResultsChange(results);
    }
  }, [value, choices]);

  return (
    <div className="searchBar" css={searchBarCss}>
      <span css={searchIconCss}>
        <Search size={17} />
      </span>
      <input
        ref={forwardedRef}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        {...rest}
      />
    </div>
  );
}
