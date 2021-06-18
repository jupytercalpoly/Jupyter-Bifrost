
Developer install
=================


To install a developer version of bifrost_jupyter_extension, you will first need to clone
the repository::

    git clone https://github.com//bifrost-jupyter-extension
    cd bifrost-jupyter-extension

Next, install it with a develop install using pip::

    pip install -e .


If you are planning on working on the JS/frontend code, you should also do
a link installation of the extension::

    jupyter nbextension install [--sys-prefix / --user / --system] --symlink --py bifrost_jupyter_extension

    jupyter nbextension enable [--sys-prefix / --user / --system] --py bifrost_jupyter_extension

with the `appropriate flag`_. Or, if you are using Jupyterlab::

    jupyter labextension install .


.. links

.. _`appropriate flag`: https://jupyter-notebook.readthedocs.io/en/stable/extending/frontend_extensions.html#installing-and-enabling-extensions
