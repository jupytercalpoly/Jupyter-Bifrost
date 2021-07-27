// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Add any needed widget imports here (or from controls)
// import {} from '@jupyter-widgets/base';

import { createTestModel } from './utils';

import { BifrostModel, BifrostView } from '..';

import BifrostReactWidget from '../components/BifrostReactWidget';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('Widget wrapping classes', () => {
  describe('BifrostModel', () => {
    it('should be createable', () => {
      const model = createTestModel(BifrostModel);
      expect(model).toBeInstanceOf(BifrostModel);
      expect(model.get('query_spec')).toBeInstanceOf(Object);
    });
  });

  describe('BifrostView', () => {
    it('should be createable', () => {
      const model = createTestModel(BifrostModel);
      const view = new BifrostView({
        model: model,
        el: document.createElement('div'),
        id: 'test',
        className: 'test-class',
        tagName: 'test-tag',
      });
      expect(view).toBeInstanceOf(BifrostView);
    });
  });
});

describe('Bifrost React Widget', () => {
  it('Should be renderable and the title of the column screen should be visible.', () => {
    const model = createTestModel(BifrostModel);
    render(BifrostReactWidget({ model }));
    screen.getByText('Select Columns');
  });
});
