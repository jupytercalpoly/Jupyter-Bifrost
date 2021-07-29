import { GraphSpec, SpecHistoryTree } from '../hooks/bifrost-model';
import { createGraphSpec } from './utils';

describe('testing spec history tree', () => {
  it('creates SpecHistoryTree Instance', () => {
    const graphSpec = createGraphSpec() as GraphSpec;
    const root = new SpecHistoryTree(graphSpec);
    expect(root).toBeInstanceOf(SpecHistoryTree);
  });

  it('adds a child to spec history', () => {
    const graphSpec = createGraphSpec() as GraphSpec;
    const root = new SpecHistoryTree(graphSpec);

    const childSpec = createGraphSpec() as GraphSpec;
    root.addChild(childSpec);

    expect(root.children[0]).toBeInstanceOf(SpecHistoryTree);
    expect(root.children).toHaveLength(1);
  });

  it('adds multiple childs to spec history', () => {
    const graphSpec = createGraphSpec() as GraphSpec;
    const root = new SpecHistoryTree(graphSpec);

    const childrenSpecs = [];
    for (let i = 0; i < 5; i++) {
      childrenSpecs.push(createGraphSpec() as GraphSpec);
    }
    childrenSpecs.forEach((childrenSpec) => root.addChild(childrenSpec));
    expect(root.children).toHaveLength(5);
  });

  it('gets a main leaf of a shallow specHistoryTree', () => {
    const graphSpec = createGraphSpec() as GraphSpec;
    const root = new SpecHistoryTree(graphSpec);

    const childrenSpecs = [];
    for (let i = 0; i < 5; i++) {
      childrenSpecs.push(createGraphSpec() as GraphSpec);
    }
    childrenSpecs.forEach((childrenSpec) => root.addChild(childrenSpec));

    const trueMainLeaf = createGraphSpec() as GraphSpec;
    root.children[0].addChild(trueMainLeaf);

    expect(root.mainLeaf).toBe(trueMainLeaf);
  });

  it('finds the node with the condition', () => {
    const graphSpec = createGraphSpec() as GraphSpec;
    const root = new SpecHistoryTree(graphSpec);

    const childrenSpecs = [];
    for (let i = 0; i < 5; i++) {
      childrenSpecs.push(createGraphSpec() as GraphSpec);
    }
    childrenSpecs.forEach((childrenSpec) => root.addChild(childrenSpec));

    const trueBarGraphSpec = createGraphSpec({ mark: 'bar' }) as GraphSpec;
    root.children[0].addChild(trueBarGraphSpec);

    const barGraphSpec = root.find((node) => node.spec.mark === 'bar')?.spec;
    expect(barGraphSpec).toBe(trueBarGraphSpec);
  });
});
