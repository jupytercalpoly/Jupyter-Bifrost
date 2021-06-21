#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.

import pytest
import pandas as pd
import json
from unittest import TestCase

from ..bifrost import BifrostWidget


def test_example_creation_blank():
    w = BifrostWidget()
    df = pd.DataFrame([[1, "Jay"], [2, "John"]], columns=[ "Favorite Number","Name"])
    expected = {
            "mark": "bar",
            "data": {
                "values": [
                    { "Name": "Jay", "Favorite Number": 1},
                    { "Name": "John", "Favorite Number": 2},
                ]
            },
            "encoding": {
                "x": {"field": "Name", "type": "nominal"},
                "y": {"field": "Favorite Number", "type": "quantitative"},
            }

        }
    
    # TODO: Make this a deep compare
    actual = w.create_graph_data(df, "bar", "Name", "Favorite Number")
    TestCase().assertDictEqual(actual,expected)
    
def test_random_dist():
    w = BifrostWidget()
    print("this test")
    w.create_random_distribution({"value": 123})
    assert len(w.graph_spec) > 0
    