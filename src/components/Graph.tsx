/** @jsx jsx */
import { jsx } from '@emotion/react';
import { VegaLite, VisualizationSpec, PlainObject } from 'react-vega';

interface GraphProps {
  spec: VisualizationSpec;
  data: PlainObject | undefined;
}

export default function Graph(props: GraphProps) {
  function handleHover(e: any) {
    console.log(e);
  }

  const signalListeners = { cursor: handleHover };

  return (
    <VegaLite
      spec={props.spec}
      data={props.data}
      signalListeners={signalListeners}
    />
  );
}
