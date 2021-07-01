/**@jsx jsx */
import { jsx, css } from '@emotion/react';

const tagCss = css`
  list-style: none;
  margin-right: 10px;
  height: 23px;
  width: 95px;
  text-align: center;

  .tag-wrapper {
    background-color: #eee;
    border-radius: 15% / 50%;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
  }

  .tag-wrapper button {
    border: none;
    background-color: #eee;
    font-size: 14px;
    font-family: var(--jp-ui-font-family);
    color: var(--jp-widgets-color);
    border-radius: 50%;
    cursor: pointer;
  }

  .tag-wrapper button:hover {
    background-color: grey;
  }
`;

interface TagProps {
  children?: React.ReactNode;
}

export default function Tag(props: TagProps) {
  return (
    <li css={tagCss} className="column-tag">
      {props.children}
    </li>
  );
}
