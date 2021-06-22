/** @jsx jsx */
import { jsx } from '@emotion/react';

import Graph from './Graph';
// import Sidebar from './Sidebar';
import { WidgetModel } from '@jupyter-widgets/base';
import {BifrostModelContext} from "../hooks/bifrost-model"

interface BifrostReactWidgetProps {
  model: WidgetModel;
}

export default function BifrostReactWidget(props: BifrostReactWidgetProps) {

  return (
    <BifrostModelContext.Provider value={props.model}>
       <article className="BifrostWidget">
      <Graph/>
    </article>
    </BifrostModelContext.Provider>
   
  );
}
