"""Top-level package for Bifrost Tracing."""

__author__ = """Jay Ahn"""
__email__ = 'aju960219@gmail.com'
__version__ = '0.1.0'

from .bifrost_tracing import BifrostTracing, BifrostWatcher
# from IPython import get_ipython




# def load_ipython_extension(ipython):
#     ipython.register_magics(BifrostTracing)
#     vw = BifrostWatcher(ipython)
#     ipython.events.register('post_run_cell', vw.post_run_cell)
#     return vw


# Watcher = load_ipython_extension(get_ipython())
