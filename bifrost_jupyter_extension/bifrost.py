#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.
import pandas as pd
import random, typing

from traitlets.traitlets import validate, observe

"""
TODO: Add module docstring
"""
import numpy as np
from typing import List as ListType
from ipywidgets import DOMWidget, register
from traitlets import Unicode, List, Int, Dict
from ._frontend import module_name, module_version
from IPython.core.display import display


# class DfProperty(typing.TypedDict):
#     variables: list[str]

def plot(df:pd.DataFrame, kind="line", x=None, y=None) -> pd.DataFrame:
    w = BifrostWidget(df, kind, x, y)
    display(w)
    return w.df_history[-1]


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
    operation_history = list()
    current_dataframe_index = Int(0).tag(sync=True)
    graph_spec = Dict({}).tag(sync=True)
    df_variable_name:str = "" 
    output_variable: str = ""
    generate_random_dist = Int(0).tag(sync=True)
    # for now it contains all columns
    df_prop = List([]).tag(sync=True)

    def __init__(self, df:pd.DataFrame, kind="line", x=None, y=None, **kwargs):
        super().__init__(**kwargs)
        self.df_history.append(df)
        spec = self.create_graph_data(self.df_history[-1], kind)
        # self.set_trait("df_prop", list(df.columns))
        self.set_trait("graph_spec", spec)


    @observe("generate_random_dist")
    def create_random_distribution(self, changes):
        graph_kinds = ['tick', 'bar', 'line', 'point']
        kind = random.choice(graph_kinds)
        dist = np.random.uniform(0,1, (random.randint(25,50), 2))
        df = pd.DataFrame(dist, columns=["x", "y"])
        self.df_history.append(df)
        spec = self.create_graph_data(self.df_history[-1], kind)
        self.set_trait("graph_spec", spec)
        self.set_trait("df_prop", list(df.columns))


    def create_graph_data(self, df: pd.DataFrame, kind: str, x:str=None, y:str=None) -> dict:
        """
            Converts a dataframe into a Vega Lite Graph JSON string.
        """
        graph_types = {
            "quantitative": ["int64", "float64"],
            "temporal": ["datetime", "timedelta[ns]"],
            "nominal": ["object", "category", "bool"]
        } # TODO add more  
        if not x:
            x = df.columns[0]

        if not y:
            y = df.columns[1]
            
        graph_df = df[[x,y]]
        data = {"values": [{x: row[x], y:row[y]} for _, row in graph_df.iterrows()]}
        types = graph_df.dtypes
        
        def map_to_graph_type(dtype: str) -> str:
            for graph_type, dtypes in graph_types.items():
                if dtype in dtypes:
                    return graph_type
            return "nominal"
        
        types = {k: map_to_graph_type(str(v)) for k,v in types.items()}

        graph_spec = {
            "width": 400,
            "height": 200,
            "mark": {"type": kind, "tooltip": True},
            "params": [{"name": "brush", "select": "interval"}],
            "signals": [{'name': 'tooltip'}],
            "data": {"name": "values"},
            "encoding": {
                "x": {"field": x, "type": types[x]},
                "y": {"field": y, "type": types[y]},
            }
        }

        # TODO: Figure out aggregation etc.

        return {"data": data, "spec": graph_spec}




