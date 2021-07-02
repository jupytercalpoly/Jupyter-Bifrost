#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.

from .bifrost import BifrostWidget
from ._version import __version__, version_info
import typing
import pandas as pd
from IPython.core.display import display

@pd.api.extensions.register_dataframe_accessor("bifrost")
class BifrostAccessor:
    def __init__(self, pandas_obj: typing.Union[pd.DataFrame, pd.Series]):
        self._obj = pandas_obj

    def plot(self, kind=None, x=None, y=None, color=None) -> pd.DataFrame:
        w = BifrostWidget(self._obj, kind, x, y, color)
        display(w)
        return w.df_history[-1]

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
