import typing
import pandas as pd
from bifrost_jupyter_extension.bifrost import BifrostWidget
from IPython.core.display import display


@pd.api.extensions.register_dataframe_accessor("bifrost")
class BifrostAccessor:
    def __init__(self, pandas_obj: typing.Union[pd.DataFrame, pd.Series]):
        self._obj = pandas_obj

    def plot(self, kind="line", x=None, y=None) -> pd.DataFrame:
        w = BifrostWidget(self._obj, kind, x, y)
        display(w)
        return w.df_history[-1]
