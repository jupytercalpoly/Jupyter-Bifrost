/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React from 'react';
import { caretRightIcon } from '@jupyterlab/ui-components';

const headerCss = css`
  padding: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  background: white;

  .app-title {
    color: gray;
    font-weight: 600;
  }
  .title-wrapper {
    display: flex;
    width: 100%;
    margin: 15px 0;
  }
`;

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  stepNumber: number;
}

export default function OnboardingHeader(props: HeaderProps) {
  return (
    <header css={headerCss}>
      <h3>Jupyter Bifrost</h3>
      <ProgressIndicator stepNumber={props.stepNumber} />
      <div className="title-wrapper">
        <h2>{props.title}</h2>
        <NextButton onClick={props.onNext} />
      </div>
      <div className="content">{props.children}</div>
    </header>
  );
}

let progressCss = css`
  padding: 0;
  margin: 20px;
  list-style: none;
  li {
    display: inline-block;
    margin: 0 15px;
  }

  button {
    width: 20px;
    height: 20px;
    color: gray;
    border-radius: 50%;

    &.active-step {
      color: red;
    }
  }
`;

interface ProgressProps {
  stepNumber: number;
}

function ProgressIndicator({ stepNumber }: ProgressProps) {
  const numSteps = 5;
  return (
    <ul className="ProgressIndicator" css={progressCss}>
      {new Array(numSteps).fill(0).map((_) => (
        <li>
          <button className="dot"></button>
        </li>
      ))}
    </ul>
  );
}

const nextButtonCss = css`
  padding: 20px;
  color: red;
  border-radius: 50%;
`;

function NextButton(props: { onClick: () => void }) {
  return (
    <button onClick={props.onClick} css={nextButtonCss}>
      <caretRightIcon.react />
    </button>
  );
}
