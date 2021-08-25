/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { data2schema, schema2asp, cql2asp } from 'draco-core';
import Draco from 'draco-vis';
import Loader from '../../ui-widgets/Loader';

import { GraphSpec, useModelState } from '../../../hooks/bifrost-model';
import produce from 'immer';
import { useState, useEffect } from 'react';
import { VegaLite } from 'react-vega';
import theme from '../../../theme';
import { VegaEncoding } from '../../../modules/VegaEncodings';

const nearbyTabCss = css`
  width: 100%;
  height: 100%;

  .chart-list {
    overflow: scroll;
    list-style: none;
    margin: 0;
    padding: 0;
    height: 340px;
    .chart-element {
      padding: 0;
    }
  }

  button {
    background-color: transparent;
    border: 10px solid transparent;
    &:hover {
      border: 10px solid ${theme.color.primary.light};
    }
  }

  .vega-embed {
    cursor: pointer;
  }
`;

export default function NearbyTab() {
  const [spec, setSpec] = useModelState('graph_spec');
  const data = useModelState('graph_data')[0];
  const [nearByCharts, setNearbyCharts] = useState<GraphSpec[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const graphData = { data };

  useEffect(() => {
    recommendCharts();
  }, [spec]);

  function recommendCharts() {
    if ('facet' in spec.encoding) {
      setLoading(false);
      return;
    }
    const dataSchema = data2schema(data);
    const dataAsp = schema2asp(dataSchema);

    const cqlSpec = convertVlSpecToCqlSpec(spec);

    const queryAsp = cql2asp(cqlSpec as any);

    const draco = new Draco();

    draco.init().then(() => {
      const program = 'data("data").\n' + dataAsp.concat(queryAsp).join('\n');
      const solution = draco.solve(program, { models: 5 });
      const excludeFacet = (spec: any) =>
        !(
          'facet' in (spec as GraphSpec).encoding ||
          'row' in (spec as GraphSpec).encoding
        );

      if (solution) {
        const recommendedSpecs = solution.specs
          .slice(1) // The first graph is identical to the current one, so we exclude it.
          .filter(excludeFacet)
          .map(preprocessRecommendation)
          .map((recommendedSpec) => {
            const differingEncodings = diffSpecEncodings(spec, recommendedSpec);
            return differingEncodings.reduce(
              setEncodingHighlight,
              recommendedSpec
            );
          });
        setNearbyCharts(recommendedSpecs as GraphSpec[]);
      }
      setLoading(false);
    });
  }

  function convertVlSpecToCqlSpec(spec: GraphSpec) {
    const cqlSpec_v1 = { ...spec, encodings: [] as Record<string, string>[] };
    const cqlSpec_v2 = produce(cqlSpec_v1, (gs) => {
      gs['encodings'] = Object.entries(cqlSpec_v1['encoding']).map(
        ([channel, value]) => {
          return { ...value, channel: channel };
        }
      );
    });
    return cqlSpec_v2;
  }

  function handleClickOnNearByChart(idx: number) {
    const newSpec = produce(nearByCharts[idx], (gs: GraphSpec) => {
      gs['width'] = spec.width;
      gs['height'] = spec.height;
      gs.config = {
        mark: { tooltip: true },
      };
      gs.params = [{ name: 'brush', select: 'interval' }];
      gs.transform = spec.transform;
      removeEncodingHighlights(gs);
    });
    setSpec(newSpec);
  }

  return (
    <section css={nearbyTabCss}>
      <h2>Find a Similar Chart</h2>
      <ul className="chart-list">
        {loading ? (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Loader />
          </div>
        ) : nearByCharts.length !== 0 ? (
          nearByCharts.map((spec: GraphSpec, i: number) => (
            <li className="chart-element">
              <button onClick={() => handleClickOnNearByChart(i)}>
                <VegaLite spec={spec} data={graphData} actions={false} />
              </button>
            </li>
          ))
        ) : (
          <div>No similar charts found</div>
        )}
      </ul>
    </section>
  );
}

/**
 *
 * @param specA First GraphSpec
 * @param specB Second GraphSpec
 * @returns A list of encodings that differ between the two
 */
function diffSpecEncodings(specA: GraphSpec, specB: GraphSpec): VegaEncoding[] {
  const encodingSet = new Set(Object.keys(specA.encoding) as VegaEncoding[]);
  const encodingList = Object.keys(specB.encoding) as VegaEncoding[];
  const differingEncodings = encodingList.filter((encoding) => {
    let unique = true;
    const hasSharedEncoding = encodingSet.delete(encoding);
    if (hasSharedEncoding) {
      const hasDiffAgg =
        specA.encoding[encoding].aggregate !==
        specB.encoding[encoding].aggregate;
      const hasDiffBin =
        specA.encoding[encoding].bin !== specB.encoding[encoding].bin;
      unique = hasDiffAgg || hasDiffBin;
    }
    return unique;
  });
  differingEncodings.push(...encodingSet);
  return differingEncodings;
}

/**
 * Adds a highlight to the encoding to indicate a difference between the primary and recommended spec.
 * @param spec GraphSpec to modify
 * @param encoding encoding to receive the highlight
 */
function setEncodingHighlight(spec: GraphSpec, encoding: VegaEncoding) {
  const titleColor = 'red';
  switch (encoding) {
    case 'x':
    case 'y':
      spec.encoding[encoding].axis = { titleColor };
      break;
    case 'color':
    case 'size':
    case 'shape':
      spec.encoding[encoding].legend = { titleColor };
      break;
    default:
      break;
  }
  return spec;
}

/**
 * Removes colored encoding highlights from the nearby graph.
 */
function removeEncodingHighlights(spec: GraphSpec) {
  for (const key in spec.encoding) {
    if (spec.encoding[key as VegaEncoding].axis) {
      delete spec.encoding[key as VegaEncoding].axis;
    } else if (spec.encoding[key as VegaEncoding].legend) {
      delete spec.encoding[key as VegaEncoding].legend;
    }
  }
  return spec;
}

/**
 * Converts recommendation to an appropriately formatted nearby GraphSpec
 */
function preprocessRecommendation(recommendation: any): GraphSpec {
  delete recommendation['$schema'];
  delete (recommendation['data'] as any).url;
  recommendation['data']['name'] = 'data';
  recommendation['transform'] = [];
  recommendation.width = 120;
  recommendation.height = 120;

  // delete binning if it's applied to channels other than x and y
  Object.keys(recommendation['encoding'])
    .filter((channel) => !['x', 'y'].includes(channel))
    .forEach((channel) => {
      if ('bin' in recommendation['encoding'][channel]) {
        delete recommendation['encoding'][channel]['bin'];
      }
    });

  if (['circle', 'square'].includes(recommendation.mark as string)) {
    recommendation.mark = 'point';
  }
  return recommendation;
}
