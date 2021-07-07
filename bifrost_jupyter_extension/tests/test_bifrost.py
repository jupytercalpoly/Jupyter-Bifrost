#!/usr/bin/env python
# coding: utf-8

# Copyright (c) waidhoferj.
# Distributed under the terms of the Modified BSD License.

import pytest
import pandas as pd
import json
from unittest import TestCase

from ..bifrost import BifrostWidget


def test_example_creation():
    # df = pd.DataFrame([[1, "Jay"], [2, "John"]], columns=[ "Favorite Number","Name"])
    # w = BifrostWidget(df)
    
    # expected_spec = {
    #         "width": 400,
    #         "height": 200,
    #         "mark": "?",
    #         "params": [{"name": "brush", "select": "interval"}],
    #         "signals": [{'name': 'tooltip'}],
    #         "data": {"name": "data"},
    #         "encodings": [
    #             {"field": "Favorite Number", "type": "quantitative", "channel" : "?"},
    #             {"field": "Name", "type": "nominal", "channel" : "?"}
    #         ],
    #         "chooseBy": "effectiveness"
    #     }
    
    # # TODO: Make this a deep compare
    # actual = w.create_graph_data(df)
    # print(actual)
    # TestCase().assertDictEqual(actual["spec"]["spec"],expected_spec)
    pass