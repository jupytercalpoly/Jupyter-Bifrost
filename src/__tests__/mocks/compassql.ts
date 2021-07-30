interface CompassMock {
  build: (data: any, opt?: any, tableSchema?: any) => any;
  recommend: (
    q: any,
    schema: any,
    config?: any
  ) => {
    query: any;
    result: any;
  };
  mapLeaves: (
    group: any,
    f: (item: any) => Record<string, any>
  ) => { items: any[] };
  SpecQueryModel: any;
  Query: any;
}

const compassql = jest.createMockFromModule<CompassMock>('compassql');

// Mock functions
compassql.recommend = jest.fn((q, schema, config) => ({
  query: {},
  result: [],
}));
compassql.build = jest.fn((data, opt) => ({}));
compassql.mapLeaves = jest.fn((group, f) => ({ items: [{ encoding: {} }] }));

module.exports = compassql;
