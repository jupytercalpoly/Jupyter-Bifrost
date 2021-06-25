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
    operation_history = List([]).tag(sync=True)
    current_dataframe_index = Int(0).tag(sync=True)
    graph_spec = Dict({}).tag(sync=True)
    graph_encodings = Dict({}).tag(sync=True)
    df_variable_name:str = "" 
    output_variable: str = ""
    generate_random_dist = Int(0).tag(sync=True)
    df_columns = List([]).tag(sync=True)
    selected_data = List([]).tag(sync=True)

    def __init__(self, df:pd.DataFrame, kind="line", x=None, y=None, **kwargs):
        super().__init__(**kwargs)
        self.df_history.append(df)

        if not x:
            x = df.columns[0]
        if not y:
            y = df.columns[1]
        self.set_trait("df_columns", list(df.columns))
        self.set_trait("graph_encodings", {"x": x, "y": y})
        self.set_trait("selected_data", [])
        spec = self.create_graph_data(self.df_history[-1], kind, x=x,y=y)
        self.set_trait("graph_spec", spec)
        

    @observe("graph_encodings")
    def update_graph_from_cols(self, changes):
        embeddings = changes["new"]
        graph_kinds = ['tick', 'bar', 'line']
        kind = random.choice(graph_kinds)
        spec = self.create_graph_data(self.df_history[-1], 
        kind, 
        x=embeddings.get("x"), 
        y=embeddings.get("y"), 
        color=embeddings.get("color"))
        self.set_trait("graph_spec", spec)

    @observe("current_dataframe_index")
    def change_dataframe(self, changes):
        df_index:int = changes["new"]
        print(self.graph_encodings)


    @observe("generate_random_dist")
    def create_random_distribution(self, _):
        graph_kinds = ['tick', 'bar', 'line', 'point']
        kind = random.choice(graph_kinds)
        dist = np.random.uniform(0,1, (random.randint(25,50), 4))
        df = pd.DataFrame(dist, columns=["foo", "bar", "something", "else"])
        self.df_history.append(df)
        spec = self.create_graph_data(self.df_history[-1], kind)
        self.set_trait("df_columns", list(df.columns))
        self.set_trait("graph_spec", spec)
        # self.set_trait("df_prop", list(df.columns))

    @observe("df_columns")
    def on_col_change(self, change):
        print(change["new"])

        

    def create_graph_data(self, df: pd.DataFrame, kind: str, x:str=None, y:str=None, color:str=None) -> dict:
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

        def map_to_graph_type(dtype: str) -> str:
                    for graph_type, dtypes in graph_types.items():
                        if dtype in dtypes:
                            return graph_type
                    return "nominal"
        df_filter = [col for col in [x,y, color] if col]
        graph_df = df[df_filter]

        data = {"data": [{col: row[col] for col in df_filter} for _, row in graph_df.iterrows()]}
        types = graph_df.dtypes
        
        
        
        types = {k: map_to_graph_type(str(v)) for k,v in types.items()}

        graph_spec = {
            "width": 400,
            "height": 200,
            "mark": {"type": kind, "tooltip": True},
            "params": [{"name": "brush", "select": "interval"}],
            "signals": [{'name': 'tooltip'}],
            "data": {"name": "data"},
            "encoding": {
                encoding : {"field": col, "type": types[col]} for encoding, col in zip(["x", "y", "color"], df_filter)
            }
        }

        # TODO: Figure out aggregation etc.

        return {"data": data, "spec": graph_spec}




