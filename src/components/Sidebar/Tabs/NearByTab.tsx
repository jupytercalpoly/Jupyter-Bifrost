/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { data2schema, schema2asp, cql2asp } from 'draco-core';
import Draco from 'draco-vis';

import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import produce from 'immer';
import { useState, useEffect } from 'react';
import { VegaLite } from 'react-vega';
import theme from '../../../theme';

const nearByTabCss = css`
  width: 100%;
  overflow: scroll;
  height: 100%;

  button:hover {
    border: 10px solid ${theme.color.primary.light};
  }

  .vega-embed {
    cursor: pointer;
  }
`;

export default function NearByTab() {
  const [spec, setSpec] = useModelState('graph_spec');
  const data = useModelState('graph_data')[0];
  const [nearByCharts, setNearbyCharts] = useState<GraphSpec[]>([]);
  const graphData = { data };

  useEffect(() => {
    recommendCharts();
  }, [spec]);

  function recommendCharts() {
    const dataSchema = data2schema(data);
    const dataAsp = schema2asp(dataSchema);

    const cqlSpec = convertVlSpecToCqlSpec(spec);

    const queryAsp = cql2asp(cqlSpec as any);

    const draco = new Draco();

    draco.init().then(() => {
      const program = 'data("data").\n' + dataAsp.concat(queryAsp).join('\n');
      const solution = draco.solve(program, { models: 3 });

      if (solution) {
        const recommendedSpecs = solution.specs.map((spec) =>
          produce(spec, (gs) => {
            delete gs['$schema'];
            delete (gs['data'] as any).url;
            gs['data']['name'] = 'data';
            gs['transform'] = [];
            gs.width = 150;
            gs.height = 150;
          })
        );
        setNearbyCharts(recommendedSpecs as GraphSpec[]);
      }
    });
  }

  function convertVlSpecToCqlSpec(spec: GraphSpec) {
    const cqlSpec_v1 = { ...spec, encodings: [] as Record<string, string>[] };
    const cqlSpec_v2 = produce(cqlSpec_v1, (gs) => {
      // delete gs['config'];
      gs['encodings'] = Object.entries(cqlSpec_v1['encoding']).map(
        ([channel, value]) => {
          return { ...value, channel: channel };
        }
      );
    });
    return cqlSpec_v2;
  }

  function handleClickOnNearByChart(idx: number) {
    const newSpec = produce(nearByCharts[idx], (gs) => {
      gs['width'] = spec.width;
      gs['height'] = spec.height;
      gs.config = {
        mark: { tooltip: true },
      };
      gs.params = [{ name: 'brush', select: 'interval' }];
      // gs.transform = spec.transform;
    });
    console.log(newSpec);
    setSpec(newSpec);
  }

  return (
    <section css={nearByTabCss}>
      {nearByCharts.map((spec: GraphSpec, i: number) => (
        <button
          style={{ backgroundColor: 'transparent' }}
          onClick={() => handleClickOnNearByChart(i)}
        >
          <VegaLite spec={spec} data={graphData} actions={false} />
        </button>
      ))}
    </section>
  );
}
