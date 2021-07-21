/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { VegaLite } from 'react-vega';
import { useModelState } from '../hooks/bifrost-model';

const graphCss = css`
  .vega-embed.has-actions {
    details {
      position: absolute;
      top: -28px;
      left: 75px;
    }
  }
`;
export default function Graph() {
  const [selectedData, setSelectedData] = useModelState('selected_data');
  const spec = useModelState('graph_spec')[0];

  function handleBrush(...args: any) {
    console.log(args);
    setSelectedData(args);
  }

  console.log(selectedData);

  const data = useModelState('graph_data')[0];
  const graphData = { data };

  // multiple signals can be added by adding a new field
  const signalListeners = { brush: handleBrush };

  return (
    <div css={graphCss}>
      <VegaLite
        spec={spec}
        data={graphData}
        signalListeners={signalListeners}
      />
    </div>
  );
}
