export const vegaEncodingList = [
  'x',
  'y',
  'x2',
  'y2',
  'xError',
  'yError',
  'xError2',
  'yError2',

  // Polar Position Channels
  'theta',
  'radius',
  'theta2',
  'radius2',

  // Geographic Position Channels
  'longitude',
  'latitude',
  'longitude2',
  'latitude2',

  // Mark Properties Channels
  'color',
  'opacity',
  'fillOpacity',
  'strokeOpacity',
  'strokeWidth',
  'strokeDash',
  'size',
  'angle',
  'shape',

  // Text and Tooltip Channels
  'text',
  'tooltip',

  // Hyperlink Channel
  'href',

  // Description Channel
  'description',

  // Level of Detail Channel
  'detail',

  // Key Channel
  'key',

  // Order Channel
  'order',

  // Facet Channels
  'facet',
  'row',
  'column',
] as const;

const vegaColTypesList = [
  'quantitative',
  'temporal',
  'ordinal',
  'nominal',
  'geojson',
] as const;

// 
export const vegaAggregationList = [
// "argmax",
// "argmin",
// "ci0",
// "ci1",
"count",
"distinct",
"max",
"mean",
"median",
"min",
 "missing",
 "product",
//  "q1",
//  "q3",
 "stderr",
 "stdev",
 "stdevp",
 "sum",
 "valid",
 "values",
 "variance",
 "variancep"

] as const;




export const vegaParamPredicatesList = ["equal", "lt", "lte", "gt", "gte", "range", "oneOf", "valid"] as const;

export type VegaColumnType = typeof vegaColTypesList[number];

export type VegaEncoding = typeof vegaEncodingList[number];

export type VegaAggregation = typeof vegaAggregationList[number];
export type VegaParamPredicate = typeof vegaParamPredicatesList[number];

