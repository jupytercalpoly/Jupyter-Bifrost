/**@jsx jsx */
import { css, jsx } from '@emotion/react';
import { OnboardingScreenProps } from './OnboardingScreen';
import NavHeader from './NavHeader';
import { useState } from 'react';

const marks = [
  'area',
  'bar',
  'circle',
  'line',
  'point',
  'rect',
  'rule',
  'square',
  'text',
  'tick',
];

const markScreenCss = css`
  ul {
    list-style: none;
    height: 300px;
    overflow-y: scroll;
    .mark {
      padding: 15px;
      transform: translateX(0px);
      transition: transform 0.5s;
      background-color: transparent;
      cursor: pointer;
      font-weight: 400;

      &.selected {
        font-weight: 800;
      }

      &:hover {
        transform: translateX(5px);
        background-color: whitesmoke;
      }
    }
  }
`;

export default function MarkScreen(props: OnboardingScreenProps) {
  const [selectedMark, setSelectedMark] = useState('');
  return (
    <article className="MarkScreen" css={markScreenCss}>
      <NavHeader
        title="What kind of marks would you like to use?"
        onNext={props.onNext}
        onPrevious={props.onBack}
      ></NavHeader>

      <ul>
        {marks.map((mark) => (
          <li
            className={mark === selectedMark ? 'mark selected' : 'mark'}
            onClick={() => setSelectedMark(mark)}
          >
            {mark}
          </li>
        ))}
      </ul>
    </article>
  );
}
