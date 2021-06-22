/** @jsx jsx */
import { css, jsx } from '@emotion/react';

export default function Welcome(props: any) {
  return (
    <h1
      className="WelcomeTitle"
      css={css`
        color: red;
      `}
    >
      Hello, {props.name}
    </h1>
  );
}
