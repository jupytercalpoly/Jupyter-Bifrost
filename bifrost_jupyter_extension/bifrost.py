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

"""
TODO: Add module docstring
"""
import numpy as np
from ipywidgets import DOMWidget, register
from traitlets import Unicode, List, Int, Dict, Bool
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

    df_history = list()
    spec_history = List([]).tag(sync=True)
    current_dataframe_index = Int(0).tag(sync=True)
    query_spec = Dict({}).tag(sync=True)
    graph_spec = Dict({}).tag(sync=True)
    plot_function_args = Dict({}).tag(sync=True)
    graph_data = List([]).tag(sync=True)
    graph_encodings = Dict({}).tag(sync=True)
    df_variable_name = Unicode("").tag(sync=True)
    output_variable = Unicode("").tag(sync=True)
    generate_random_dist = Int(0).tag(sync=True)
    df_columns = List([]).tag(sync=True)
    selected_columns = List([]).tag(sync=True)
    selected_mark = Unicode("").tag(sync=True)
    selected_data = List([]).tag(sync=True)
    suggested_graphs = List([]).tag(sync=True)

    def __init__(self, df:pd.DataFrame, kind=None, x=None, y=None, color=None, **kwargs):
        super().__init__(**kwargs)
        self.df_history.append(df)
        self.set_trait("df_columns", list(df.columns))
        self.set_trait("selected_data", [])
        graph_info = self.create_graph_data(self.df_history[-1], kind=kind, x=x, y=y, color=color)
        self.set_trait("query_spec", graph_info["query_spec"])
        self.set_trait("graph_data", graph_info["data"])
        self.set_trait("graph_spec", graph_info["graph_spec"])
        self.set_trait("plot_function_args", graph_info["args"])
        if df_watcher.plot_output: self.set_trait("output_variable", df_watcher.plot_output)
        if df_watcher.bifrost_input: self.set_trait("df_variable_name", df_watcher.bifrost_input)
        

    @observe("graph_spec")
    def update_graph_from_cols(self, changes):
        # Vega spec is updated from the frontend. To track history, respond to these changes here.
        pass


    @observe("generate_random_dist")
    def create_random_distribution(self, _):
        graph_kinds = ['tick', 'bar', 'line', 'point']
        kind = random.choice(graph_kinds)
        dist = np.random.uniform(0,1, (random.randint(25,50), 4))
        df = pd.DataFrame(dist, columns=["foo", "bar", "something", "else"])
        self.df_history.append(df)
        graph_info = self.create_graph_data(self.df_history[-1], kind)
        self.set_trait("df_columns", list(df.columns))
        self.set_trait("graph_spec", graph_info["spec"])
        self.set_trait("graph_data", graph_info["data"])

    def create_graph_data(self, df: pd.DataFrame, kind: str = None, x:str=None, y:str=None, color:str=None) -> dict:
        """
            Converts a dataframe into a Vega Lite Graph JSON string.
        """
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

        data = json.loads(df.to_json(orient="records"))
        
        x_provided = (x != None)
        y_provided = (y != None)
        kind_provided = kind != None

        graph_spec = {}
        query_spec = {}
        query_spec_template = {
                "config":{
                    "mark": {"tooltip": True}
                },
                "width": 400,
                "height": 200,
                "params": [{"name": "brush", "select": "interval"}],
                "data": {"name": "data"},
                "transform": [],
                "chooseBy": "effectiveness"
            }

        if x_provided and y_provided:
            df_filter = [col for col in [x, y, color] if col]
            graph_df = df[df_filter]
            types = graph_df.dtypes
            types = {k: map_to_graph_type(str(v)) for k,v in types.items()}

            if kind_provided:
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
                        encoding : {"field": col, "type": types[col]} for encoding, col in zip(["x", "y", "color"], df_filter)
                    }
                }

                query_spec = {
                    **query_spec_template,
                    "mark": kind,
                    "encodings": [{"field": col, "type": types[col], "channel": encoding } for encoding, col in zip(["x", "y", "color"], df_filter)],
                }

            else:
                encodings = []
                if x in graph_df.columns:
                    encodings.append({"field": x, "type": types[x], "channel" : "x"})

                if y in graph_df.columns:
                    encodings.append({"field": y, "type": types[y], "channel" : "y"})

                if color in graph_df.columns:
                    encodings.append({"field": color, "type": types[color], "channel" : "color"})

                query_spec = {
                    **query_spec_template,
                    "mark": "?",
                    "encodings": encodings,
                }
        else:
            types = df.dtypes
            types = {k: map_to_graph_type(str(v)) for k,v in types.items()}

            if not kind_provided:
                kind = '?'

            encodings = []

            if x in df.columns:
                encodings.append({"field": x, "type": types[x], "channel" : "x"})

            if y in df.columns:
                encodings.append({"field": y, "type": types[y], "channel" : "y"})

            if color in df.columns:
                encodings.append({"field": color, "type": types[color], "channel" : "color"})

            for col in set(df.columns) - set({x, y, color}):                
                encodings.append({"field": col, "type": types[col], "channel" : "?"})

            query_spec = {
                **query_spec_template,
                "mark": kind,
                "encodings": encodings,
            }


        return {"data": data, "query_spec" :{"spec": query_spec}, "graph_spec": graph_spec, "args": {"x": x, "y": y, "color": color, "kind": None if kind == "?" else kind}}




