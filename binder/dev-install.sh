#!/usr/bin/env bash

echo -n "Checking yarn... "
yarn -v
if [ $? -ne 0 ]; then
    echo "'yarn -v' failed, therefore yarn is not installed.  In order to perform a
    developer install of bifrost you must have both yarn and pip installed on your
    machine! See https://yarnpkg.com/lang/en/docs/install/ for installation instructions."
    exit 1
fi

echo -n "Checking pip... "
pip --version
if [ $? -ne 0 ]; then
    echo "'pip --version' failed, therefore pip is not installed. In order to perform
    a developer install of bifrost you must have both pip and yarn installed on
    your machine! See https://packaging.python.org/installing/ for installation instructions."
    exit 1
fi

echo -n "Checking JupyterLab (assuming JupyterLab >=3)... "
jupyter lab --version 2>/dev/null
if [ $? -ne 0 ]; then
    echo "no, skipping installation of widgets for jupyterlab"
    skip_jupyter_lab=yes
fi

echo -n "Checking node... "
node -v

conda install nodejs

# All following commands must run successfully
set -e

echo "Setting NODE_OPTIONS env varible"
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Pip installing bifrost extension"
pip install -e .

echo "Cleaning up some files"
shopt -s extglob 
rm -rf !(examples|bifrost_jupyter_extension|jupyter-bifrost-tracing|test)