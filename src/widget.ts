// Copyright (c) waidhoferj
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';
import React from 'react';
import ReactDOM from 'react-dom';
import BifrostReactWidget from './components/BifrostReactWidget';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

export class BifrostModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: BifrostModel.model_name,
      _model_module: BifrostModel.model_module,
      _model_module_version: BifrostModel.model_module_version,
      _view_name: BifrostModel.view_name,
      _view_module: BifrostModel.view_module,
      _view_module_version: BifrostModel.view_module_version,
      operation_history: [],
      output_variable: '',
      current_dataframe_index: 0,
      graph_spec: {},
      graph_encodings: {},
      generate_random_dist: 0,
      df_columns: [],
      selected_data: [],
      selected_columns: [],
      selected_mark: '',
      graph_data: [],
      suggested_graphs: [],
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'BifrostModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'BifrostView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class BifrostView extends DOMWidgetView {
  render() {
    this.el.classList.add('bifrost-widget');

    const component = React.createElement(BifrostReactWidget, {
      model: this.model,
    });
    ReactDOM.render(component, this.el);
  }
}
