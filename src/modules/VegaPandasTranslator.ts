import {
  vegaParamPredicatesList,
  VegaParamPredicate,
  VegaAggregation,
} from './VegaEncodings';
import { GraphSpec, EncodingInfo } from '../hooks/bifrost-model';

const filterTypes = new Set<string>(vegaParamPredicatesList);

interface AggFunc {
  (encoding: EncodingInfo, dfName: string): string;
}
const vegaAggToPd: { [vegaAgg: string]: string | AggFunc } = {
  count: 'count',
  valid: (encoding, dfName) =>
    `${dfName}.join(${dfName}.dropna().groupby(group_fields).count()["${encoding.field}"], on=group_fields, rsuffix=" valid count")`,
  missing: (encoding, dfName) =>
    `${dfName}.join(${dfName}.groupby(group_fields)["${encoding.field}"].apply(lambda x: x.isnull().sum()), on=group_fields, rsuffix=" missing")`,
  distinct: (encoding, dfName) =>
    `${dfName}.join(${dfName}.dropna().groupby(group_fields).unique()["${encoding.field}"], on=group_fields, rsuffix=" distinct")`,
  sum: 'sum',
  product: 'prod',
  mean: 'mean',
  variance: 'var',
  variancep: (encoding, dfName) =>
    `${dfName}.join(${dfName}.groupby(group_fields).var(ddof=0)["${encoding.field}"], on=group_fields, rsuffix=" population variance")`,
  stdev: 'std',
  stdevp: (encoding, dfName) =>
    `${dfName}.join(${dfName}.groupby(group_fields).std(ddof=0)["${encoding.field}"], on=group_fields, rsuffix=" population std")`,
  stderr: (encoding, dfName) =>
    `${dfName}.join(${dfName}.groupby(group_fields).sem()["${encoding.field}"], on=group_fields, rsuffix=" stderr")`,
  median: 'median',
  min: 'min',
  max: 'max',
};

export default class VegaPandasTranslator {
  private getQueryFromFilter(filterConfig: any, dfName: string): string {
    return Object.keys(filterConfig)
      .filter((key) => filterTypes.has(key))
      .map((filterType) => {
        let query: string;
        switch (filterType as VegaParamPredicate) {
          case 'gte':
            query = `(${dfName}['${filterConfig.field}'] >= ${filterConfig.gte})`;
            break;
          case 'lte':
            query = `(${dfName}['${filterConfig.field}'] <= ${filterConfig.lte})`;
            break;
          case 'range':
            // Expects number range like {range: [0, 5]}.
            query = `(${dfName}['${filterConfig.field}'] >= ${filterConfig.range[0]}) & (${dfName}['${filterConfig.field}'] <= ${filterConfig.range[1]})`;
            break;
          case 'oneOf':
            query = `(${dfName}['${
              filterConfig.field
            }'].isin([${filterConfig.oneOf
              .map((str: string) => `"${str}"`)
              .toString()}]))`;
            break;

          default:
            query = '';
            break;
        }
        return query;
      })
      .join('&');
  }

  private getFilterFromTransform(
    transform: GraphSpec['transform'],
    dfName: string
  ) {
    return transform
      .map((t) => {
        const compoundOperator =
          'or' in t.filter ? 'or' : 'and' in t.filter ? 'and' : null;
        if (compoundOperator) {
          // Handle compound query ex. "and", "or", "not"
          const connector = compoundOperator === 'or' ? '|' : '&';
          const compFilters = t.filter[compoundOperator].map((filter: any) =>
            this.getQueryFromFilter(filter, dfName)
          );
          let query = compFilters.join(connector);
          if (compFilters.length > 1) {
            query = '(' + query + ')';
          }
          return query;
        } else {
          return this.getQueryFromFilter(t.filter, dfName);
        }
      })
      .join('&');
  }

  private getAggregations(encodings: GraphSpec['encoding'], dfName: string) {
    const encodingVals = Object.values(encodings);
    return encodingVals
      .filter((encoding) => 'aggregate' in encoding)
      .map((encoding) => {
        const agg = vegaAggToPd[encoding.aggregate as VegaAggregation];
        const otherEncodedFields = encodingVals
          .filter((otherEncoding) => otherEncoding !== encoding)
          .map((otherEncoding) => `"${otherEncoding.field}"`);
        const pandasGroupFields = `group_fields = [${otherEncodedFields.toString()}]`;
        if (typeof agg === 'string') {
          return [
            pandasGroupFields,
            `${dfName} = ${dfName}.join(${dfName}.groupby(group_fields).agg("${agg}")["${encoding.field}"], on=group_fields, rsuffix=" ${agg}")`,
          ].join('\n');
        } else {
          return [
            pandasGroupFields,
            `${dfName} = ${agg(encoding, dfName)}`,
          ].join('\n');
        }
      })
      .join('\n');
  }

  /**
   *
   * @param spec Graph spec to convert to pandas code
   * @param inputDf Name of the DataFrame which is the target of the Bifrost Plot
   * @param outputDf Name of the DataFrame which is assigned to the output of bifrost.plot()
   * @returns Pandas code that applies the spec changes to the inputDf.
   */
  convertSpecToCode(spec: GraphSpec, inputDf = '', outputDf = '') {
    // Filters
    const filterQuery = this.getFilterFromTransform(spec.transform, inputDf);
    const filteredDs = filterQuery.length
      ? `${outputDf} = ${inputDf}[${filterQuery}]`
      : '';
    // Aggregators
    const aggregations = this.getAggregations(spec.encoding, outputDf);

    const code = [filteredDs, aggregations].join('\n');
    const isAlphaNum = /\w/;

    return isAlphaNum.test(code) ? code : inputDf;
  }
}
