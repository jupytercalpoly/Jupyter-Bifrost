# Jupyter Bifrost

![Github Actions Status](https://github.com/jupytercalpoly/Jupyter-Bifrost/workflows/Build/badge.svg) [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupytercalpoly/Jupyter-Bifrost.git/main?urlpath=lab%2Ftree%2Fexamples%2Fintroduction.ipynb) [![npm version](https://badge.fury.io/js/jupyter_bifrost.svg)](https://badge.fury.io/js/jupyter_bifrost) [![PyPI version](https://badge.fury.io/py/jupyter-bifrost.svg)](https://badge.fury.io/py/jupyter-bifrost) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) 

![Jupyter Bifrost Workflow](docs/resources/ChartSelection.gif)
A Jupyter Widget for Interactive Data Visualization. Bifrost provides useful chart recommendations and easy integration with Pandas DataFrames. It also provides a variety of analysis tools:

- Chart history log for keeping track of your data analysis.
- Targeted graph suggestions to drive further data exploration.
- Interactive filters for quantitative and categorical fields.
- Aggregations and binning for axis encodings.
- An expressive Python API

The extension allows data scientists to build familiarity with a dataset without sacrificing the reproducibility of code. Changes made in the Bifrost GUI are automatically translated into Pandas Queries, allowing developers to jump back into scripting whenever it is most convenient.

## Getting Started

### Installation

You can install using `pip`:

```bash
pip install jupyter_bifrost
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:

```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] jupyter_bifrost
```

### Using the Extension

Jupyter Bifrost is intended to be used in Jupyter Notebooks in JupyterLab. Start by importing the package:

```python
from jupyter_bifrost import Chart
```

Then instantiate the chart object with a dataset:

```python
chart = Chart("<my-dataset>.csv")
#or
df = pd.DataFrame()
chart = Chart(df)
```

Finally, plot the dataset to open up the Bifrost GUI:

```python
res = chart.plot()
# the `res` DataFrame will always stay up to date with the filters and aggregations applied in the GUI
```

For additional help with the extension, take a look at the wiki, or the help menu located in the menu bar of the Bifrost GUI.

## Development Installation

Create a dev environment:

```bash
conda create -n jupyter_bifrost-dev -c conda-forge nodejs yarn python jupyterlab
conda activate jupyter_bifrost-dev
```

Install the python. This will also build the TS package.

```bash
pip install -e ".[test, examples]"
```

When developing your extensions, you need to manually enable your extensions with the
notebook / lab frontend. For lab, this is done by the command:

```
jupyter labextension develop --overwrite .
yarn run build
```

For classic notebook, you need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py jupyter_bifrost
jupyter nbextension enable --sys-prefix --py jupyter_bifrost
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

### How to see your changes

#### Typescript:

If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect.

#### Python:

If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.
