interface DracoMock {
  asp2vl: (facts: string[]) => {};
  data2schema: (data: any[]) => { stats: {}; size: number };
  schema2asp: (schema: { states: {}; size: number }) => string[];
  cql2asp: (spec: any) => string[];
}

const draco = jest.createMockFromModule<DracoMock>('draco-core');

// Mock functions
draco.asp2vl = jest.fn((facts) => {
  return {};
});
draco.data2schema = jest.fn((data) => ({ stats: {}, size: 0 }));
draco.schema2asp = jest.fn((schema) => []);
draco.cql2asp = jest.fn((spec) => []);

module.exports = draco;
