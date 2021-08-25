import os, sys
import typing
import pandas as pd
from .bifrost import BifrostWidget
from IPython.core.display import display


class Chart:
    def __init__(self, data: typing.Union[pd.DataFrame, pd.Series, str]):
        self._dataFrame = self._prepare_data(data)
        self.mark = None
        self.encoding = {"x": None, "y": None, "color": None}

    def _prepare_data(self, data) -> pd.DataFrame:
        if isinstance(data, pd.DataFrame):
            return data
        if isinstance(data, pd.Series):
            return pd.DataFrame(data)
        elif isinstance(data, str):
            filename, fileext = os.path.splitext(data)
            if fileext == ".csv":
                return pd.read_csv(data)
            else:
                raise ValueError(f"Unsupported data type: {fileext}.")
        else:
            raise ValueError(f"Unsupported data: {data}.")

    @staticmethod
    def _validate(obj, x, y, color):
        if x is not None and x not in obj.columns:
            raise AttributeError(
                f"Error !!! This DataFrame doesn't have a column: {x}."
            )
        elif y is not None and y not in obj.columns:
            raise AttributeError(
                f"Error !!! This DataFrame doesn't have a column: {y}."
            )
        elif color is not None and color not in obj.columns:
            raise AttributeError(
                f"Error !!! This DataFrame doesn't have a column: {color}."
            )

    def mark_point(self) -> "Chart":
        self.mark = "point"
        return self

    # def mark_circle(self) -> "Chart":
    #     self.mark = "circle"
    #     return self

    # def mark_square(self) -> "Chart":
    #     self.mark = "square"
    #     return self

    def mark_bar(self) -> "Chart":
        self.mark = "bar"
        return self

    def mark_tick(self) -> "Chart":
        self.mark = "tick"
        return self

    def mark_line(self) -> "Chart":
        self.mark = "line"
        return self

    def mark_boxplot(self) -> "Chart":
        self.mark = "boxplot"
        return self

    def mark_errorband(self) -> "Chart":
        self.mark = "errorband"
        return self

    def mark_errorbar(self) -> "Chart":
        self.mark = "errorbar"
        return self

    def encode(self, x: str = None, y: str = None, color: str = None) -> "Chart":
        try:
            self._validate(self._dataFrame, x, y, color)
        except AttributeError as e:
            print(e)
            sys.exit(1)

        self.encoding["x"] = x
        self.encoding["y"] = y
        self.encoding["color"] = color
        return self

    def format_string(self, s):
        if not s:
            return None
        return s.replace(" ", "_").replace("(", "").replace(")", "")

    def plot(self) -> pd.DataFrame:
        formatted_x, formatted_y, formatted_color = [
            self.format_string(self.encoding[key]) for key in self.encoding
        ]
        original_columns = self._dataFrame.columns

        # space and parenthesis not allowed for Draco
        formatted_columns = [
            self.format_string(column) for column in self._dataFrame.columns
        ]
        self._dataFrame.columns = formatted_columns

        column_name_map = dict(zip(formatted_columns, original_columns))
        w = BifrostWidget(
            self._dataFrame,
            column_name_map,
            self.mark,
            formatted_x,
            formatted_y,
            formatted_color,
        )
        display(w)
        # reset
        self.mark = None
        self.encoding = {"x": None, "y": None, "color": None}
        return self._dataFrame if w.output_variable else None
