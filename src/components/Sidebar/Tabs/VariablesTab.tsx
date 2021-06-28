/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import produce from 'immer';
import {
  GraphSpec,
  EncodingInfo,
  useModelState,
  QuerySpec,
} from '../../../hooks/bifrost-model';

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
type Encoding = 'x' | 'y' | 'color';
const possibleEncodings: Encoding[] = ['x', 'y', 'color'];
export default function VariablesTab() {
  const columns = useModelState<string[]>('df_columns')[0];
  const querySpec = useModelState<QuerySpec>('query_spec')[0];
  const [graphSpec, setGraphSpec] = useModelState<GraphSpec>('graph_spec');

  const updateEncodings = (encoding: Encoding, column: string) => {
    if (Object.values(graphSpec.encoding).includes(column)) {
      return;
    }
    const dtype = querySpec.spec.encodings
      .filter((encoding: any) => encoding.field === column)
      .map((encoding: any) => encoding.type)[0];

    const newSpec = produce(graphSpec, (gs) => {
      if (gs.encoding[encoding]) {
        const info = gs.encoding[encoding] as EncodingInfo;
        info.field = column;
        info.type = dtype;
      }
      gs.encoding[encoding] = { field: column, type: dtype };
    });
    setGraphSpec(newSpec);
  };

  return (
    <section className="VariablesTab" css={variableTabCss}>
      {Object.entries(graphSpec.encoding).map(([encoding, col]) => (
        <p key={encoding + '=' + col.field}>
          {encoding} : {col.field}
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
