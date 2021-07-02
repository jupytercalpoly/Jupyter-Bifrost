import { createContext, useContext, useEffect, useState } from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import { PlainObject, VisualizationSpec } from 'react-vega';
import { Query } from 'compassql/build/src/query/query';
import { ResultTree } from 'compassql/build/src/result';
import { TopLevel, FacetedUnitSpec } from 'vega-lite/build/src/spec';
import { VegaColumnType, VegaEncoding } from '../modules/VegaEncodings';
export const BifrostModelContext = createContext<WidgetModel | undefined>(
  undefined
);

const noop = (a: any) => a;

// TYPES AND INTERFACES
//============================================================================================

type ModelStateName =
  | 'df_history'
  | 'spec_history'
  | 'current_dataframe_index'
  | 'graph_spec'
  | 'query_spec'
  | 'df_variable_name'
  | 'output_variable'
  | 'generate_random_dist'
  | 'df_columns'
  | 'graph_encodings'
  | 'selected_data'
  | 'selected_columns'
  | 'selected_mark'
  | 'graph_data'
  | 'suggested_graphs'
  | 'flags';

interface ModelCallback {
  (model: WidgetModel, event: Backbone.EventHandler): void;
}

export type SuggestedGraphs = (
  | TopLevel<FacetedUnitSpec<string>>
  | ResultTree<TopLevel<FacetedUnitSpec<string>>>
)[];

export type GraphData = PlainObject;
export type QuerySpec = Query;

export interface EncodingInfo {
  field: string;
  type: VegaColumnType | '';
  scale?: {
    [scaleType: string]: any;
  };
  aggregate?: string;
}

export type GraphSpec = VisualizationSpec & {
  width: number;
  height: number;
  mark: string;
  encoding: Record<VegaEncoding, EncodingInfo>;
  transform: {
    [transformType: string]: any;
  }[];
  data: { name: string };
};

export type Flags = {
  columns_provided: boolean;
  kind_provided: boolean;
};

// HOOKS
//============================================================================================

/**
 *
 * @param name property name in the Python model object.
 * @param mutation optional mutator that is run on the Python model value before setting the JavaScript state.
 * @returns model state and set state function.
 */
export function useModelState<T>(
  name: ModelStateName,
  mutation: (val: any) => T = noop
): [T, (val: T, options?: any) => void] {
  const model = useModel();
  const [state, setState] = useState<T>(mutation(model?.get(name)));

  useModelEvent(
    `change:${name}`,
    (model) => {
      setState(mutation(model.get(name)));
    },
    [name]
  );

  function updateModel(val: T, options?: any) {
    model?.set(name, val);
    model?.save_changes();
  }

  return [state, updateModel];
}

/**
 * Subscribes a listener to the model event loop.
 * @param event Signal event that will trigger the callback.
 * @param callback Action to perform when event happens.
 * @param deps dependencies that should be kept up to date within the callback.
 */
export function useModelEvent(
  event: string,
  callback: ModelCallback,
  deps?: React.DependencyList | undefined
) {
  const model = useModel();

  const dependencies = deps === undefined ? [model] : [...deps, model];
  useEffect(() => {
    const callbackWrapper = (e: Backbone.EventHandler) =>
      model && callback(model, e);
    model?.on(event, callbackWrapper);
    return () => void model?.unbind(event, callbackWrapper);
  }, dependencies);
}

/**
 * An escape hatch in case you want full access to the model.
 * @returns Python Bifrost model
 */
export function useModel() {
  return useContext(BifrostModelContext);
}
