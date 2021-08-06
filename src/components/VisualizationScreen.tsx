/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import Sidebar from './Sidebar/Sidebar';
import React, { useState } from 'react';
import NavBar from './NavBar';
import Graph from './Graph';
import { VegaEncoding } from '../modules/VegaEncodings';
import SideBarCollapsibleButtonIcon from '../assets/icons/SideBarCollapsibleButtonIcon';
import theme from '../theme';

const bifrostWidgetCss = css`
  // Element-based styles
  //===========================================================
  display: grid;
  grid-template-columns: 720px minmax(450px, 600px);
  grid-template-rows: 40px 500px;
  grid-template-areas: 'nav sidebar' 'graph sidebar';
  height: 100%;

  @media screen and (max-width: 1300px) {
    display: block;
  }

  .side-bar-collapsible-button {
    transition: transform 0.4s ease-in-out;
    transform-origin: 40% 35%;
    cursor: pointer;

    &.open {
      transform: rotate(-270deg);
    }
  }
  .nav-wrapper {
    display: flex;
    justify-content: space-between;
    background: transparent;
  }
`;

interface VisualizationProps {
  onPrevious?: () => void;
}

export default function VisualizationScreen({
  onPrevious,
}: VisualizationProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const graphRef = React.useRef<HTMLDivElement>(null);
  const [clickedAxis, setClickedAxis] = useState<VegaEncoding | ''>('');
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);

  function updateClickedAxis(encoding: VegaEncoding | ''): void {
    setClickedAxis(encoding);
  }

  function onClickCollapsibleButton() {
    setSideBarOpen(!sideBarOpen);
  }

  return (
    <article className="BifrostWidget" css={bifrostWidgetCss}>
      {onPrevious ? (
        <GridArea area="nav">
          <div className={'nav-wrapper'}>
            <NavBar onBack={onPrevious} />
            <div
              className={`side-bar-collapsible-button${
                sideBarOpen ? ' open' : ''
              }`}
              onClick={onClickCollapsibleButton}
            >
              <SideBarCollapsibleButtonIcon
                color={
                  sideBarOpen
                    ? theme.color.primary.standard
                    : theme.color.primary.light
                }
              />
            </div>
          </div>
        </GridArea>
      ) : null}
      <GridArea area="graph" ref={graphRef}>
        <Graph
          sideBarRef={sidebarRef}
          graphRef={graphRef}
          clickedAxis={clickedAxis}
          updateClickedAxis={updateClickedAxis}
        />
      </GridArea>
      {sideBarOpen ? (
        <GridArea area="sidebar" ref={sidebarRef}>
          <Sidebar
            graphRef={graphRef}
            clickedAxis={clickedAxis}
            updateClickedAxis={updateClickedAxis}
          />
        </GridArea>
      ) : null}
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
