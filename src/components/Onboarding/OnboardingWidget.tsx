/** @jsx jsx */
import { jsx } from '@emotion/react';
import VisualizationScreen from '../VisualizationScreen';

import {
  useModelState,
  SuggestedGraphs,
  Args,
} from '../../hooks/bifrost-model';

import { useState } from 'react';

import ChartChooser from './ChartChooser';
import ColumnScreen from './ColumnScreen';

import { VisualizationSpec } from 'react-vega';

import { build } from 'compassql/build/src/schema';
import { recommend } from 'compassql/build/src/recommend';
import { mapLeaves } from 'compassql/build/src/result';
import { SpecQueryModel } from 'compassql/build/src/model';

interface onboardingWidgetProps {
  screenName: string;
  setScreenName: React.Dispatch<React.SetStateAction<string>>;
  args: Args;
}

export default function OnboardingWidget(props: onboardingWidgetProps) {
  const setSelectedSpec = useState<VisualizationSpec>({})[1];
  const [suggestedGraphs, setSuggestedGraphs] =
    useModelState('suggested_graphs');
  const querySpec = useModelState('query_spec')[0];
  const data = useModelState('graph_data')[0];

  let Screen: JSX.Element;

  switch (props.screenName) {
    case 'columnChooser':
      Screen = (
        <ColumnScreen
          onNext={() => props.setScreenName('chartChooser')}
          args={props.args}
        />
      );
      break;
    case 'chartChooser':
      Screen = (
        <ChartChooser
          onChartSelected={(spec) => {
            setSelectedSpec(spec);
            props.setScreenName('visualize');
          }}
          onBack={
            suggestedGraphs.length === 0
              ? undefined
              : () => props.setScreenName('columnChooser')
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
        <VisualizationScreen
          onPrevious={() => props.setScreenName('chartChooser')}
        />
      );
      break;
    default:
      Screen = (
        <ColumnScreen
          onNext={() => props.setScreenName('chartChooser')}
          args={props.args}
        />
      );
      break;
  }
  return Screen;
}
