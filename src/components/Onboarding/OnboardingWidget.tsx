/** @jsx jsx */
import { jsx } from '@emotion/react';
import VisualizationScreen from '../VisualizationScreen';

import {
  useModelState,
  SuggestedGraphs,
  GraphData,
  QuerySpec,
} from '../../hooks/bifrost-model';

import { useState } from 'react';

import ChartChooser from './ChartChooser';
import ColumnScreen from './ColumnScreen';

import { VisualizationSpec } from 'react-vega';

import { build } from 'compassql/build/src/schema';
import { recommend } from 'compassql/build/src/recommend';
import { mapLeaves } from 'compassql/build/src/result';
import { SpecQueryModel } from 'compassql/build/src/model';
import { FieldQuery } from 'compassql/build/src/query/encoding';

interface onboardingWidgetProps {
  screenName: string;
  setScreenName: React.Dispatch<React.SetStateAction<string>>;
}

export default function OnboardingWidget(props: onboardingWidgetProps) {
  const setSelectedSpec = useState<VisualizationSpec>({})[1];
  const [suggestedGraphs, setSuggestedGraphs] =
    useModelState<SuggestedGraphs>('suggested_graphs');
  const querySpec = useModelState<QuerySpec>('query_spec')[0];
  const data = useModelState<GraphData>('graph_data')[0];
  const columnChoices = useModelState<string[]>('df_columns')[0];

  let Screen: JSX.Element;
  const preSelectedColumns = new Set<string>();

  switch (props.screenName) {
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
          onNext={() => props.setScreenName('chartChooser')}
          preSelectedColumns={preSelectedColumns}
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
          onNext={() => props.setScreenName('chartChooser')}
          preSelectedColumns={preSelectedColumns}
        />
      );
      break;
  }
  return Screen;
}
