/**@jsx jsx */
import { jsx, css } from '@emotion/react';

const pillCss = css`
  display: inline-block;
  list-style: none;
  padding: 4px;
  background: #dedede;
  border-radius: 15px;
  border: 1px solid transparent;
  transition: border-color 0.5s;
  width: min-content;
  margin: 7px;

  &:hover {
    border-color: gray;
  }

  .content-wrapper {
    display: flex;
    align-items: center;
  }

  button {
    margin: 0 10px;
  }
`;

const activeCss = (theme: any) => css`
  background-color: ${theme.color.primary[0]};
  color: white;
  svg {
    color: white;
  }
`;

interface PillProps {
  children?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export default function Pill(props: PillProps) {
  return (
    <li css={[pillCss, props.active && activeCss]} onClick={props.onClick}>
      <div className="content-wrapper">{props.children}</div>
    </li>
  );
}
