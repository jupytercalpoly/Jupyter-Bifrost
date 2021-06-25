/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React from 'react';
import { ArrowRight } from 'react-feather';

const headerCss = css`
  padding: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  background: white;

  .app-title {
    color: #98a19f;
    font-weight: 700;
    font-size: 17px;
    margin: 7px 0;
  }

  .section-title {
    font-weight: 800;
  }

  .title-wrapper {
    display: flex;
    justify-content: space-between;
    width: 100%;
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
      <h3 className="app-title">Jupyter Bifrost</h3>
      <ProgressIndicator stepNumber={props.stepNumber} />
      <div className="title-wrapper">
        <h2 className="section-title">{props.title}</h2>
        <NextButton onClick={props.onNext} />
      </div>
      <div className="content">{props.children}</div>
    </header>
  );
}

let progressCss = css`
  padding: 0;
  list-style: none;

  li {
    width: 12px;
    height: 12px;
    display: inline-block;
    margin: 0 3px;
    background-color: #98a19f;
    border-radius: 50%;
    &.active-step {
      background-color: #b62f2f;
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
      {new Array(numSteps).fill(0).map((_, i) => (
        <li className={i == stepNumber ? 'active-step' : ''}></li>
      ))}
    </ul>
  );
}

const nextButtonCss = css`
  padding: 10px;
  background-color: #e97575;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 35px;
  height: 35px;
`;

function NextButton(props: { onClick: () => void }) {
  return (
    <button onClick={props.onClick} css={nextButtonCss}>
      <ArrowRight size={35} color="white" />
    </button>
  );
}
