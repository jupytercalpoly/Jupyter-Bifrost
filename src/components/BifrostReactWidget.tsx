/** @jsx jsx */
import { jsx } from '@emotion/react';

import Graph from './Graph';
// import Sidebar from './Sidebar';
import { WidgetModel } from '@jupyter-widgets/base';
import { useEffect, useState } from 'react';
import { VisualizationSpec, PlainObject } from 'react-vega';
interface BifrostReactWidgetProps {
  model: WidgetModel;
}

export default function BifrostReactWidget(props: BifrostReactWidgetProps) {
  const [spec, setSpec] = useState<VisualizationSpec>({});
  const [graphData, setGraphData] = useState<PlainObject | undefined>({});
  useEffect(() => {
    function updateGraph() {
      const rawSpec: any = props.model.get('graph_spec');
      console.log(rawSpec);
      setSpec({ ...rawSpec, data: { name: 'data' } });
      setGraphData(rawSpec.data);
    }
    props.model.on('change:graph_spec', updateGraph);

    return () => void props.model.unbind('change:graph_spec', updateGraph);
  }, []);

  function createRandomDist() {
    props.model.set('generate_random_dist', Date.now());
    props.model.save_changes();
  }

  return (
    <article className="BifrostWidget">
      <Graph spec={spec} data={graphData} />
      <button onClick={createRandomDist}>Create Dist</button>
      {/* <Sidebar /> */}
    </article>
  );
}
