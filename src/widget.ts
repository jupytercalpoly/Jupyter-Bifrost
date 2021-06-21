// Copyright (c) waidhoferj
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';
import embed from "vega-embed"

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
      operation_history : [],
      output_variable: "",
      current_dataframe_index : 0,
      graph_spec: {},
      generate_random_dist: 0
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
  
  private graphEl: HTMLDivElement;
  private testButton: HTMLButtonElement;

  render() {
    this.el.classList.add('bifrost-widget');
    this.graphEl = document.createElement('div');
    this.graphEl.id = "vis";
    this.el.appendChild(this.graphEl);
    this.testButton = document.createElement("button");
    this.testButton.innerText = "Change Distribution";
    this.createRandomDist = this.createRandomDist.bind(this);
    this.testButton.addEventListener("click", this.createRandomDist);
    this.el.appendChild(this.testButton);

    // Python -> Javscript update
    this.model.on('change:graph_spec', this.graphChanged, this);
  }

  createRandomDist() {
    this.model.set("generate_random_dist",Date.now());
    this.model.save_changes();
    this.graphChanged();
  }

  graphChanged() {
    const graphSpec = this.model.get("graph_spec");
    console.log(graphSpec);
    embed("#vis", graphSpec);
  }
}
