/** @jsx jsx */
import { jsx, css, ThemeProvider, Global } from '@emotion/react';

// import Graph from './Graph';
import Sidebar from './Sidebar/Sidebar';
import { WidgetModel } from '@jupyter-widgets/base';
import {
  BifrostModelContext,
  useModelState,
  Flags,
  SuggestedGraphs,
  GraphData,
  QuerySpec,
} from '../hooks/bifrost-model';
import React, { useState } from 'react';
import ChartChooser from './Onboarding/ChartChooser';
import NavBar from './NavBar';
import ColumnScreen from './Onboarding/ColumnScreen';
import { VisualizationSpec } from 'react-vega';
import Graph from './Graph';
import theme from '../theme';

import { build } from 'compassql/build/src/schema';
import { recommend } from 'compassql/build/src/recommend';
import { mapLeaves } from 'compassql/build/src/result';
import { SpecQueryModel } from 'compassql/build/src/model';
import { FieldQuery } from 'compassql/build/src/query/encoding';

const bifrostWidgetCss = css`
  // Element-based styles
  //===========================================================
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas: 'nav sidebar' 'graph sidebar';
  max-width: calc(100% - 64px);
`;

const globalStyles = (theme: any) => css`
  // Global styles for the widget
  //===========================================================
  * {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
    transition: transform 0.4s;
    background-color: ${theme.color.primary[0]};
    color: white;
    font-weight: 700;
    padding: 10px 15px;
    border-radius: 7px;
    font-size: 16px;
    border: none;

    &:active {
      transform: scale(0.95);
    }

    &.wrapper {
      border: none;
      background: transparent;
      margin: 0;
      padding: 0;
      color: initial;
    }
  }

  h1 {
    font-size: 35px;
    font-weight: 800;
    margin: 10px 0;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 25px;
    font-weight: 800;
  }
`;

interface BifrostReactWidgetProps {
  model: WidgetModel;
}

export default function BifrostReactWidget(props: BifrostReactWidgetProps) {
  return (
    <ThemeProvider theme={theme}>
      <BifrostModelContext.Provider value={props.model}>
        <OnBoardingWidget />
        <Global styles={globalStyles} />
      </BifrostModelContext.Provider>
    </ThemeProvider>
  );
}

export function OnBoardingWidget() {
  const flags = useModelState<Flags>('flags')[0];
  const setSelectedSpec = useState<VisualizationSpec>({})[1];
  const [suggestedGraphs, setSuggestedGraphs] =
    useModelState<SuggestedGraphs>('suggested_graphs');
  const querySpec = useModelState<QuerySpec>('query_spec')[0];
  const data = useModelState<GraphData>('graph_data')[0];
  const columnChoices = useModelState<string[]>('df_columns')[0];

  const [screenName, setScreenName] = flags['columns_provided']
    ? flags['kind_provided']
      ? useState('straight_visualize')
      : useState('chartChooser')
    : useState('columnChooser');

  let Screen: JSX.Element;
  const preSelectedColumns = new Set<string>();

  switch (screenName) {
    case 'columnChooser':
      querySpec.spec.encodings.forEach((encoding: FieldQuery) => {
        if (
          encoding.channel !== '?' &&
          columnChoices.includes(encoding.field as string)
        ) {
          preSelectedColumns.add(encoding.field as string);
        }
      });

      Screen = (
        <ColumnScreen
          onNext={() => setScreenName('chartChooser')}
          preSelectedColumns={preSelectedColumns}
        />
      );
      break;
    case 'chartChooser':
      Screen = (
        <ChartChooser
          onChartSelected={(spec) => {
            setSelectedSpec(spec);
            setScreenName('visualize');
          }}
          onBack={
            suggestedGraphs.length === 0
              ? undefined
              : () => setScreenName('columnChooser')
          }
        />
      );

      if (suggestedGraphs.length === 0) {
        const opt = {};

        const schema = build(data, opt);

        const result = recommend(querySpec, schema, opt).result;

        const vlTree = mapLeaves(result, (item: SpecQueryModel) => {
          const newSpec: Record<string, any> = item.toSpec();
          newSpec['params'] = (querySpec.spec as Record<string, any>)['params'];
          return newSpec;
        });

        const items = vlTree.items;

        if (items.length !== 0) {
          setSuggestedGraphs(items as SuggestedGraphs);
        }
      }
      break;
    case 'visualize':
      Screen = (
        <VisualizationScreen onPrevious={() => setScreenName('chartChooser')} />
      );
      break;
    default:
      Screen = <VisualizationScreen />;
      break;
  }
  return Screen;
}

function VisualizationScreen({ onPrevious }: { onPrevious?: () => void }) {
  return (
    <article className="BifrostWidget" css={bifrostWidgetCss}>
      {onPrevious ? (
        <GridArea area="nav">
          <NavBar onBack={onPrevious} />
        </GridArea>
      ) : null}
      <GridArea area="graph">
        {onPrevious ? <Graph onBack={onPrevious} /> : <Graph />}
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
