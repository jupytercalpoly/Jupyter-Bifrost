/** @jsx jsx */
import { css, jsx } from '@emotion/react';
// import { StringExt } from '@lumino/algorithm';


const searchBarCss = css`

`

interface SearchBarProps {
    onSelected: (value: string) => void,
    choices: string[]
}

export default function SearchBar(props: SearchBarProps) {
    return <div className="SearchBar" css={searchBarCss}>
        <input type="text" list="dl" />
        <datalist id="dl" >
        {props.choices.map(choice => <option value={choice} onClick={() => props.onSelected(choice)}>{choice}</option>)}
        </datalist>
    </div>
}