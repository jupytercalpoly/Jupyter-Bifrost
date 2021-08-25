/** @jsx jsx */
import { jsx, css } from '@emotion/react';

import Sidebar from './Sidebar/Sidebar';
import React, { useState } from 'react';
import NavBar from './NavBar';
import Graph from './Graph';
import { VegaEncoding } from '../modules/VegaEncodings';
import SideBarCollapsibleButtonIcon from '../assets/icons/SideBarCollapsibleButtonIcon';
import theme from '../theme';
import { View } from 'vega';
import { useModelState } from '../hooks/bifrost-model';
import { changeSpecProp } from '../modules/utils';

const bifrostWidgetCss = css`
  // Element-based styles
  //===========================================================
  display: grid;
  grid-template-columns: minmax(600px, min-content) minmax(max-content, auto);
  grid-template-rows: 40px auto;
  grid-template-areas: 'nav sidebar' 'graph sidebar';
  height: 100%;

  @media screen and (max-width: 1300px) {
    display: block;
  }

  .side-bar-collapsible-button {
    transition: transform 0.6s ease-in-out;
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
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(true);
  const [vegaView, setVegaView] = useState<View>();
  const [selection, setSelection] = useState<string>('zoom');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');

  function toggleSelection() {
    if (selection === 'zoom') {
      const newSpec = changeSpecProp(graphSpec, 'params', [
        { name: 'brush', select: 'interval' },
      ]);
      setSelection('brush');
      setGraphSpec(newSpec);
    } else if (selection === 'brush') {
      const newSpec = changeSpecProp(graphSpec, 'params', [
        { name: 'zoom', select: 'interval', bind: 'scales' },
      ]);
      setSelection('zoom');
      setGraphSpec(newSpec);
    }
  }

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
            <NavBar
              onBack={onPrevious}
              vegaView={vegaView}
              selection={selection}
              toggleSelection={toggleSelection}
            />
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
          sideBarOpen={sideBarOpen}
          clickSidebarButton={onClickCollapsibleButton}
          onViewCreated={setVegaView}
          selection={selection}
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
