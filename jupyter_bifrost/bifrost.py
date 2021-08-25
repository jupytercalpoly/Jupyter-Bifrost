#!/usr/bin/env python
# coding: utf-8

# Copyright (c) John Waidhofer(waidhoferj), Jay Ahn(jahn96).
# Distributed under the terms of the Modified BSD License.

import pandas as pd
import numpy as np
from importlib import import_module

bifrost_tracing = import_module(
    "..", "jupyter-bifrost-tracing.bifrost_tracing.bifrost_tracing."
)
df_watcher = bifrost_tracing.Watcher

from traitlets.traitlets import observe
from IPython import get_ipython


"""
TODO: Add module docstring
"""
from ipywidgets import DOMWidget, register
from traitlets import Unicode, List, Int, Dict, Set
from ._frontend import module_name, module_version
import json


@register
class BifrostWidget(DOMWidget):
    """
    Data representation of the graph visualization platform Bifrost
    """

    # Jupyter Widget config
    _model_name = Unicode("BifrostModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("BifrostView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    # Dataframe sources for the chart object
    df_history = list()
    # List of Vega chart specs that are used for populating the history screen
    spec_history = List([]).tag(sync=True)
    # The selected index on the history screen
    current_dataframe_index = Int(0).tag(sync=True)
    # The spec used to initialize Draco recommendations
    query_spec = Dict({}).tag(sync=True)
    # The active spec which describes the displayed Vega-Lite Graph
    graph_spec = Dict({}).tag(sync=True)
    # Encoding arguments supplied to the chart object in Python
    passed_encodings = Dict({}).tag(sync=True)
    # The mark argument supplied to the chart object in Python
    passed_kind = Unicode("").tag(sync=True)
    # The data source of the displayed graphs in Bifrost
    graph_data = List([]).tag(sync=True)
    # The user-selected bounds from brushing/zooming.
    graph_bounds = Dict({}).tag(sync=True)
    # The name of the variable that holds the dataframe which was passed to the chart object e.g. df in Chart(df)
    df_variable_name = Unicode("").tag(sync=True)
    # The name of the capturing variable that receives the output of `.plot()` e.g. res in res = Chart(df).plot()
    output_variable = Unicode("").tag(sync=True)
    # Exported code that applies the graph spec changes to the original dataframe
    df_code = Unicode("").tag(sync=True)
    # The names of each of the dataframe columns
    df_columns = List([]).tag(sync=True)
    # The max and min values for quantitative variables.
    df_column_ranges = Dict({}).tag(sync=True)
    # User-selected fields during onboarding in the ColumnSelectorSidebar
    selected_columns = List([]).tag(sync=True)
    # Ranges of data selected using the brush functionality on the primary Vega-Lite Graph.
    selected_data = List([]).tag(sync=True)
    # Graph specs recommended by Draco. Used for selecting `graph_spec`.
    suggested_graphs = List([]).tag(sync=True)
    # The data type of the contents of each column (df.dtypes)
    column_types = Dict({}).tag(sync=True)
    # Map from the Draco-safe naming scheme used in Bifrost to the original column names from the DataFrame.
    column_name_map = Dict({}).tag(sync=True)
    # Data configuration that controls sampling
    graph_data_config = Dict({"sampleSize": 100, "datasetLength": 0}).tag(sync=True)
    # The url argument that is passed to the chart object e.g. Chart("www.data.gov/...")
    input_url = Unicode("").tag(sync=True)

    def __init__(
        self,
        df: pd.DataFrame,
        column_name_map: dict,
        kind=None,
        x=None,
        y=None,
        color=None,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.df_history = [df]

        data = self.get_data(df, self.graph_data_config["sampleSize"])
        column_types = self.get_column_types(df)
        graph_info = self.create_graph_data(
            df, data, column_types, kind=kind, x=x, y=y, color=color
        )
        df.columns = column_name_map.values()
        num_cols = df.select_dtypes(include=np.number)
        column_ranges = {
            c: [num_cols[c].min(), num_cols[c].max()] for c in num_cols.columns
        }
        self.set_trait("df_columns", sorted(list(df.columns)))
        self.set_trait("df_column_ranges", column_ranges)
        self.set_trait("selected_data", [])
        self.set_trait("query_spec", graph_info["query_spec"])
        self.set_trait("graph_data", graph_info["data"])
        self.set_trait("graph_spec", graph_info["graph_spec"])
        self.set_trait("passed_encodings", graph_info["selected_encodings"])
        self.set_trait(
            "selected_columns",
            [
                encoding
                for encoding in graph_info["selected_encodings"].values()
                if encoding
            ],
        ),
        self.set_trait("passed_kind", graph_info["passed_kind"])
        self.set_trait("column_types", column_types)
        self.set_trait("column_name_map", column_name_map)
        self.set_trait(
            "graph_data_config", {"sampleSize": 100, "datasetLength": len(df)}
        )
        if df_watcher.plot_output:
            self.set_trait("output_variable", df_watcher.plot_output)
        if df_watcher.bifrost_input:
            self.set_trait("df_variable_name", df_watcher.bifrost_input)
        elif df_watcher.bifrost_input_url:
            self.set_trait("input_url", df_watcher.bifrost_input_url)

    @observe("graph_spec")
    def update_graph_from_cols(self, changes):
        # Vega spec is updated from the frontend. To track history, respond to these changes here.
        pass

    @observe("df_code")
    def update_output_dataframe(self, changes):
        code = changes["new"]
        if self.output_variable != "":
            get_ipython().run_cell(code).result

    @observe("graph_data_config")
    def update_dataset(self, changes):
        config = changes["new"]
        df_len = len(self.df_history[-1])
        if changes["old"]["sampleSize"] >= df_len and config["sampleSize"] >= df_len:
            return
        self.set_trait(
            "graph_data", self.get_data(self.df_history[-1], config["sampleSize"])
        )

    def get_data(self, df: pd.DataFrame, sample_limit: int = None):
        nan_columns = df.columns[df.isna().all()].tolist()
        if len(nan_columns):
            raise SystemError(f"{nan_columns} in this dataset have only NaN values")

        if sample_limit and sample_limit < len(df):
            df = self.get_non_na(df, sample_limit)
        return json.loads(df.to_json(orient="records"))

    def get_non_na(self, df: pd.DataFrame, sample_limit: int = None):
        indices = self.get_each_valid_data(df)
        if sample_limit:
            sample_size = sample_limit - len(indices)
            # if sample_size is negative, then set the length of indices as sampleSize
            if sample_size < 0:
                sample_size = len(indices)
                self.set_trait(
                    "graph_data_config",
                    {
                        "sampleSize": sample_size,
                        "datasetLength": self.graph_data_config["datasetLength"],
                    },
                )
            return pd.concat(
                [
                    df.loc[indices, :],
                    df.drop(indices).sample(n=sample_size),
                ]
            )

    def get_each_valid_data(self, df: pd.DataFrame) -> list:
        columns = df.columns
        valid_indices = []
        for column in columns:
            valid_idx = df[~df[column].isna()].index
            if len(valid_idx) and valid_idx[0] not in valid_indices:
                valid_indices.append(valid_idx[0])
        return valid_indices

    def get_column_types(self, df: pd.DataFrame):
        graph_types = {
            "quantitative": ["int64", "float64"],
            "temporal": ["datetime", "timedelta[ns]"],
            "nominal": ["object", "category", "bool"],
        }  # TODO add more

        def map_to_graph_type(dtype: str) -> str:
            for graph_type, dtypes in graph_types.items():
                if dtype in dtypes:
                    return graph_type
            return "nominal"

        types = df.dtypes
        types = {k: map_to_graph_type(str(v)) for k, v in types.items()}
        return types

    def create_graph_data(
        self,
        df: pd.DataFrame,
        data: dict,
        types: dict,
        kind: str = None,
        x: str = None,
        y: str = None,
        color: str = None,
    ) -> dict:
        """
        Converts a dataframe into a Vega Lite Graph JSON string.
        """

        x_provided = x != None
        y_provided = y != None
        kind_provided = kind != None

        graph_spec = {}
        query_spec = {}
        query_spec_template = {
            "width": 400,
            "height": 200,
            "data": {"name": "data"},
            "transform": [],
            "chooseBy": "effectiveness",
        }

        if x_provided and y_provided and kind_provided:
            graph_spec = {
                "config": {"mark": {"tooltip": True}},
                "width": 550,
                "height": 405,
                "mark": kind,
                # "params": [{"name": "brush", "select": "interval"}],
                "params": [{"name": "zoom", "select": "interval", "bind": "scales"}],
                "data": {"name": "data"},
                "transform": [],
                "encoding": {
                    encoding: {"field": col, "type": types[col]}
                    for encoding, col in zip(["x", "y", "color"], [x, y, color])
                    if col
                },
            }

        query_spec = {
            **query_spec_template,
            "mark": kind if kind_provided else "?",
            "encodings": [
                {"field": col, "type": types[col], "channel": encoding}
                for encoding, col in zip(["x", "y", "color"], [x, y, color])
                if col
            ],
        }

        return {
            "data": data,
            "query_spec": {"spec": query_spec},
            "graph_spec": graph_spec,
            "selected_encodings": {"x": x, "y": y, "color": color},
            "passed_kind": kind if kind else "",
        }
