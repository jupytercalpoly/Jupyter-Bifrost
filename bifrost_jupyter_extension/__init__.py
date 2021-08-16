#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.

from .bifrost import BifrostWidget
from ._version import __version__, version_info
import typing
import pandas as pd
from IPython.core.display import display
import sys

@pd.api.extensions.register_dataframe_accessor("bifrost")
class BifrostAccessor:
    def __init__(self, pandas_obj: typing.Union[pd.DataFrame, pd.Series]):
        self._obj = pandas_obj

    @staticmethod
    def _validate(obj, x, y, color):
        if x is not None and x not in obj.columns:
            raise AttributeError(f"Error !!! This DataFrame doesn't have a column: {x}.")
        elif y is not None and y not in obj.columns:
            raise AttributeError(f"Error !!! This DataFrame doesn't have a column: {y}.")
        elif color is not None and color not in obj.columns:
            raise AttributeError(f"Error !!! This DataFrame doesn't have a column: {color}.")

    def plot(self, kind=None, x=None, y=None, color=None) -> pd.DataFrame:
        try:
            self._validate(self._obj, x, y, color)
        except AttributeError as error:
            print(error)
            return

        formatted_x = self.format_string(x)
        formatted_y = self.format_string(y)
        formatted_color = self.format_string(color)

        original_columns = self._obj.columns
        # space and parenthesis not allowed for Draco
        formatted_columns = []
        for column in self._obj.columns:
            formatted_columns.append(self.format_string(column))
        self._obj.columns = formatted_columns

        column_name_map = dict(zip(formatted_columns, original_columns))

        w = BifrostWidget(self._obj, column_name_map, kind, formatted_x, formatted_y, formatted_color)
        display(w)
        return self._obj if w.output_variable else None


    def format_string(self, s):
        if not s:
            return None
        return s.replace(' ', '_').replace('(', '').replace(')', '') 

def _jupyter_labextension_paths():
    """Called by Jupyter Lab Server to detect if it is a valid labextension and
    to install the widget
    Returns
    =======
    src: Source directory name to copy files from. Webpack outputs generated files
        into this directory and Jupyter Lab copies from this directory during
        widget installation
    dest: Destination directory name to install widget files to. Jupyter Lab copies
        from `src` directory into <jupyter path>/labextensions/<dest> directory
        during widget installation
    """
    return [{
        'src': 'labextension',
        'dest': 'bifrost-jupyter-extension',
    }]


def _jupyter_nbextension_paths():
    """Called by Jupyter Notebook Server to detect if it is a valid nbextension and
    to install the widget
    Returns
    =======
    section: The section of the Jupyter Notebook Server to change.
        Must be 'notebook' for widget extensions
    src: Source directory name to copy files from. Webpack outputs generated files
        into this directory and Jupyter Notebook copies from this directory during
        widget installation
    dest: Destination directory name to install widget files to. Jupyter Notebook copies
        from `src` directory into <jupyter path>/nbextensions/<dest> directory
        during widget installation
    require: Path to importable AMD Javascript module inside the
        <jupyter path>/nbextensions/<dest> directory
    """
    return [{
        'section': 'notebook',
        'src': 'nbextension',
        'dest': 'bifrost_jupyter_extension',
        'require': 'bifrost_jupyter_extension/extension'
    }]
