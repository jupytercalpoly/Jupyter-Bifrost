/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React from 'react';
import { ArrowLeft, ArrowRight } from 'react-feather';

const headerCss = css`
  display: flex;
  justify-content: flex-start;
  padding: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  background: white;

  .app-title {
    color: #98a19f;
    font-weight: 700;
    font-size: 20px;
    margin: 7px 0;
  }

  .section-title {
    font-weight: 800;
  }

  .title-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
`;

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function NavHeader(props: HeaderProps) {
  return (
    <header css={headerCss}>
      <div className="options">
        {props.onPrevious && (
          <button className="wrapper" onClick={props.onPrevious}>
            <ArrowLeft />
          </button>
        )}
      </div>
      <div className="header-info">
        <div className="title-wrapper">
          <h2 className="section-title">{props.title}</h2>
          {props.onNext && <NextButton onClick={props.onNext} />}
        </div>
        <div className="content">{props.children}</div>
      </div>
    </header>
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
  margin-left: 20px;
`;

function NextButton(props: { onClick: () => void }) {
  return (
    <button onClick={props.onClick} css={nextButtonCss}>
      <ArrowRight size={35} color="white" />
    </button>
  );
}
