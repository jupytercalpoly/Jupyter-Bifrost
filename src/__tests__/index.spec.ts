// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Add any needed widget imports here (or from controls)
// import {} from '@jupyter-widgets/base';

import { createTestModel } from './utils';

import { BifrostModel, BifrostView } from '..';

describe('Example', () => {
  describe('BifrostModel', () => {
    it('should be createable', () => {
      const model = createTestModel(BifrostModel);
      expect(model).toBeInstanceOf(BifrostModel);
      console.log('spec', model.get('query_spec'));
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
