/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useModelState, GraphEncodings } from '../../../hooks/bifrost-model';

const variableTabCss = css`
  .columns-list {
    list-style: none;

    .column-el {
      &:hover > .encoding-list {
        visibility: visible;
      }
    }
  }

  .encoding-list {
    list-style: none;
    visibility: hidden;
  }
`;

const possibleEncodings = ['x', 'y', 'color'];
export default function VariablesTab() {
  const columns = useModelState<string[]>('df_columns')[0];
  const [graphEncodings, setGraphEncodings] =
    useModelState<GraphEncodings>('graph_encodings');

  const updateEncodings = (encoding: string, column: string) => {
    if (Object.values(graphEncodings).includes(column)) {
      return;
    }
    setGraphEncodings({ ...graphEncodings, [encoding]: column });
  };
  return (
    <section className="VariablesTab" css={variableTabCss}>
      {Object.entries(graphEncodings).map(([encoding, col]) => (
        <p key={encoding + '=' + col}>
          {encoding} : {col}
        </p>
      ))}
      <ul className="columns-list">
        {columns.map((col) => {
          return (
            <li className="column-el" key={col}>
              <span>{col}</span>
              <ul className="encoding-list">
                {possibleEncodings.map((encoding) => (
                  <button
                    onClick={() => updateEncodings(encoding, col)}
                    key={encoding + '-button'}
                  >
                    {encoding}
                  </button>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
