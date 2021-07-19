/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import Sidebar from './Sidebar/Sidebar';
import React from 'react';
import NavBar from './NavBar';
import Graph from './Graph';

const bifrostWidgetCss = css`
  // Element-based styles
  //===========================================================
  display: grid;
  grid-template-columns: 675px minmax(450px, 600px);
  grid-template-rows: auto 1fr;
  grid-template-areas: 'nav sidebar' 'graph sidebar';
  max-width: calc(100% - 64px);

  @media screen and (max-width: 1300px) {
    display: block;
  }
`;

export default function VisualizationScreen({
  onPrevious,
}: {
  onPrevious?: () => void;
}) {
  return (
    <article className="BifrostWidget" css={bifrostWidgetCss}>
      {onPrevious ? (
        <GridArea area="nav">
          <NavBar onBack={onPrevious} />
        </GridArea>
      ) : null}
      <GridArea area="graph">
        <Graph />
      </GridArea>
      <GridArea area="sidebar">
        <Sidebar />
      </GridArea>
    </article>
  );
}

interface GridAreaProps {
  area: string;
  children?: any;
}

const GridArea = React.forwardRef<HTMLDivElement, GridAreaProps>(
  (props, ref) => (
    <div style={{ gridArea: props.area }} ref={ref}>
      {props.children}
    </div>
  )
);
