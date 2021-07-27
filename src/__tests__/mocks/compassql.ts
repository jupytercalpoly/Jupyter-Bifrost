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
  mapLeaves: (group: any, f: (item: any) => any) => any;
  SpecQueryModel: any;
  Query: any;
}
const compassql = jest.createMockFromModule<CompassMock>('compassql');

module.exports = compassql;
