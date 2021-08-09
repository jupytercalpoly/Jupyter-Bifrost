#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.
import pandas as pd
import random, typing
from importlib import import_module
bifrost_tracing = import_module("..", "jupyter-bifrost-tracing.bifrost_tracing.bifrost_tracing.")
df_watcher = bifrost_tracing.Watcher

from traitlets.traitlets import observe
from IPython import get_ipython


"""
TODO: Add module docstring
"""
from ipywidgets import DOMWidget, register
from traitlets import Unicode, List, Int, Dict
from ._frontend import module_name, module_version
from IPython.core.display import JSON, display
import json


@register
class BifrostWidget(DOMWidget):
    """
        Data representation of the graph visualization platform Bifrost
    """
    _model_name = Unicode('BifrostModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('BifrostView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    spec_history = List([]).tag(sync=True)
    current_dataframe_index = Int(0).tag(sync=True)
    query_spec = Dict({}).tag(sync=True)
    graph_spec = Dict({}).tag(sync=True)
    plot_function_args = Dict({}).tag(sync=True)
    graph_data = List([]).tag(sync=True)
    graph_bounds = Dict({}).tag(sync=True)
    graph_encodings = Dict({}).tag(sync=True)
    df_variable_name = Unicode("").tag(sync=True)
    output_variable = Unicode("").tag(sync=True)
    # Exported code that applies the graph spec changes to the original dataframe
    df_code = Unicode("").tag(sync=True)
    df_columns = List([]).tag(sync=True)
    selected_columns = List([]).tag(sync=True)
    selected_mark = Unicode("").tag(sync=True)
    selected_data = List([]).tag(sync=True)
    suggested_graphs = List([]).tag(sync=True)
    column_types = Dict({}).tag(sync=True)
    column_name_map = Dict({}).tag(sync=True)
    graph_data_config = Dict({"maxRows": 100, "sample": False}).tag(sync=True)


    def __init__(self, df:pd.DataFrame, column_name_map: dict, kind=None, x=None, y=None, color=None, **kwargs):
        super().__init__(**kwargs)
        self.df_history.append(df)
        data = self.get_data(df, self.graph_data_config["maxRows"])
        column_types = self.get_column_types(df)
        graph_info = self.create_graph_data(df, data, column_types, kind=kind, x=x, y=y, color=color)

        self.set_trait("df_columns", sorted(list(df.columns)))
        self.set_trait("selected_data", [])
        self.set_trait("query_spec", graph_info["query_spec"])
        self.set_trait("graph_data", graph_info["data"])
        self.set_trait("graph_spec", graph_info["graph_spec"])
        self.set_trait("plot_function_args", graph_info["args"])
        self.set_trait("column_types", column_types)
        self.set_trait("column_name_map", column_name_map)

        df.columns = column_name_map.values()
        if df_watcher.plot_output: self.set_trait("output_variable", df_watcher.plot_output)
        if df_watcher.bifrost_input: self.set_trait("df_variable_name", df_watcher.bifrost_input)
        

    @observe("graph_spec")
    def update_graph_from_cols(self, changes):
        # Vega spec is updated from the frontend. To track history, respond to these changes here.
        pass

    @observe("df_code")
    def update_output_dataframe(self, changes):
        code = changes["new"]
        print(code)
        get_ipython().run_cell(code).result


    @observe("graph_data_config")
    def update_dataset(self, changes):
        config = changes["new"]
        if changes["old"]["sample"] == config["sample"] or config["maxRows"] >= len(self.df_history[-1]):
            return
        if config["sample"]:
            self.set_trait("graph_data", self.get_data(self.df_history[-1], config["maxRows"]))
        else:
            self.set_trait("graph_data", self.get_data(self.df_history[-1]))


    def get_data(self, df: pd.DataFrame, sampleLimit:int=None):
        if sampleLimit:
            df = df.sample(n=sampleLimit)
        return json.loads(df.to_json(orient="records"))

    def get_column_types(self, df: pd.DataFrame):
        graph_types = {
            "quantitative": ["int64", "float64"],
            "temporal": ["datetime", "timedelta[ns]"],
            "nominal": ["object", "category", "bool"]
        } # TODO add more  

        def map_to_graph_type(dtype: str) -> str:
            for graph_type, dtypes in graph_types.items():
                if dtype in dtypes:
                    return graph_type
            return "nominal"

        types = df.dtypes
        types = {k: map_to_graph_type(str(v)) for k,v in types.items()}
        return types


    def create_graph_data(self, df: pd.DataFrame, data: dict, types: dict, kind: str = None, x:str=None, y:str=None, color:str=None) -> dict:
        """
            Converts a dataframe into a Vega Lite Graph JSON string.
        """
        
        x_provided = (x != None)
        y_provided = (y != None)
        kind_provided = kind != None

        graph_spec = {}
        query_spec = {}
        query_spec_template = {
                "width": 400,
                "height": 200,
                "data": {"name": "data"},
                "transform": [],
                "chooseBy": "effectiveness"
            }

        if x_provided and y_provided and kind_provided:
            graph_spec = {
                "config":{
                    "mark": {"tooltip": True}
                },
                "width": 550,
                "height": 405,
                "mark": kind,
                "params": [{"name": "brush", "select": "interval"}],
                "data": {"name": "data"},
                "transform": [],
                "encoding": {
                    encoding : {"field": col, "type": types[col]} for encoding, col in zip(["x", "y", "color"], [x, y, color]) if col
                }
            }

        query_spec = {
            **query_spec_template,
            "mark": kind if kind_provided else "?",
            "encodings": [{"field": col, "type": types[col], "channel": encoding } for encoding, col in zip(["x", "y", "color"],  [x, y, color]) if col],
        }

        # TODO: Figure out aggregation etc.

        return {"data": data, "query_spec" :{"spec": query_spec}, "graph_spec": graph_spec, "args": {"x": x, "y": y, "color": color, "kind": kind}}




