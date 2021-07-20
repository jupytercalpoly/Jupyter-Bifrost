import { createContext, useContext, useEffect, useState } from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import { PlainObject, VisualizationSpec } from 'react-vega';
import { Query } from 'compassql/build/src/query/query';
import { ResultTree } from 'compassql/build/src/result';
import { TopLevel, FacetedUnitSpec } from 'vega-lite/build/src/spec';
import { VegaColumnType, VegaEncoding } from '../modules/VegaEncodings';
import { ModelState } from '../widget';

// CONTEXT
//============================================================================================
export const BifrostModelContext = createContext<WidgetModel | undefined>(
  undefined
);

// TYPES AND INTERFACES
//============================================================================================

interface ModelCallback {
  (model: WidgetModel, event: Backbone.EventHandler): void;
}

export type SuggestedGraphs = (
  | TopLevel<FacetedUnitSpec<string>>
  | ResultTree<TopLevel<FacetedUnitSpec<string>>>
)[];

export type GraphData = PlainObject[];
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
  mark: string | Record<string, any>;
  encoding: Record<VegaEncoding, EncodingInfo>;
  params: any[];
  transform: {
    [transformType: string]: any;
  }[];
  data: { name: string };
};

export type Args = {
  x: string;
  y: string;
  color: string;
  kind: string;
};

export type SelectionData = [
  string,
  { [field: string]: [number, number] | string[] }
];
// HOOKS
//============================================================================================

/**
 *
 * @param name property name in the Python model object.
 * @param mutation optional mutator that is run on the Python model value before setting the JavaScript state.
 * @returns model state and set state function.
 */
export function useModelState<K extends keyof ModelState>(
  name: K
): [ModelState[K], (val: ModelState[K], options?: any) => void] {
  const model = useModel();
  const [state, setState] = useState<ModelState[K]>(model?.get(name));

  useModelEvent(
    `change:${name}`,
    (model) => {
      setState(model?.get(name));
    },
    [name]
  );

  function updateModel(val: ModelState[K], options?: any) {
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
