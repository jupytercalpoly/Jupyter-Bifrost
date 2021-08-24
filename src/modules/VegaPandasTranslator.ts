import {
  vegaParamPredicatesList,
  VegaParamPredicate,
  VegaAggregation,
  VegaAxisScale,
} from './VegaEncodings';
import { GraphSpec, EncodingInfo } from '../hooks/bifrost-model';
import { isFunction } from './utils';

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
    `${dfName}.join(${dfName}.dropna().groupby(group_fields)["${encoding.field}"].unique(), on=group_fields, rsuffix=" distinct")`,
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
  /**
   * Extracts a pandas query from the vega-lite filter object.
   * @param filterConfig Object that describes the filtering action.
   * @param dfName Variable name of the Python DataFrame.
   * @returns a Pandas query string.
   */
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

  /**
   * Translates vega-lite graph transformations into Pandas queries.
   * @param transform An array of vega-lite graph transformations.
   * @param dfName Variable name of the Python DataFrame.
   * @returns A compound Pandas query string that enact the transform operations.
   */
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

  /**
   * Transforms encoding-based vega-lite aggregations into Pandas code
   * @param encodings Encodings of a vega-lite graph
   * @param dfName The name of the variable which holds the Python DataFrame.
   * @returns a Pandas query string.
   */
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
        } else if (isFunction(agg)) {
          return [
            pandasGroupFields,
            `${dfName} = ${agg(encoding, dfName)}`,
          ].join('\n');
        } else {
          return '';
        }
      })
      .join('\n');
  }

  /**
   * Creates a pandas column which is the result the vega-lite axis binning operation
   */
  private getBinning(encodings: GraphSpec['encoding'], dfName: string) {
    const encodingInfo: EncodingInfo[] = Object.values(encodings);
    return encodingInfo
      .filter((info) => info.bin)
      .map(({ field }) => {
        const series = `${dfName}["${field}"]`;
        return `_bifrost_bins = pd.cut(${series}, bins=pd.interval_range(start=${series}.min(), freq=10, end=${series}.max())).rename("${field} (bin)")\n${dfName} = pd.concat((${dfName}, _bifrost_bins), axis=1)
        `;
      })
      .join('\n');
  }

  /**
   * Creates a pandas column which is the result the vega-lite axis scaling operation
   */
  private getAxisScaling(encodings: GraphSpec['encoding'], dfName: string) {
    const encodingInfo: EncodingInfo[] = Object.values(encodings);
    const columns = encodingInfo
      .filter(
        (info) =>
          'scale' in info && info.scale!.type && info.scale!.type !== 'linear'
      )
      .map((info) => {
        const field = info.field;
        const scale: VegaAxisScale = info.scale!.type;
        const columnName = `${field} (${scale})`;
        let query = '';
        switch (scale) {
          case 'log':
            query = `np.log(df["${field}"])`;
            break;
          case 'pow':
            query = `np.exp(df["${field}"])`;
            break;
          case 'sqrt':
            query = `np.sqrt(df["${field}"])`;
            break;
        }
        return `${query}.rename("${columnName}")`;
      })
      .join(',');

    return columns.length
      ? `${dfName} = pd.concat((${dfName}, ${columns}), axis=1)`
      : '';
  }

  /**
   * Converts a vega-lite graph spec to Pandas Python code.
   * @param spec Graph spec to convert to Pandas code
   * @param inputDf Name of the DataFrame which is the target of the Bifrost Plot
   * @param outputDf Name of the DataFrame which is assigned to the output of bifrost.plot()
   * @returns Pandas code that applies the spec changes to the inputDf.
   */
  convertSpecToCode(
    spec: GraphSpec,
    inputDf = '',
    inputUrl = '',
    outputDf = ''
  ) {
    const codeBlocks: string[] = [];
    const inputDataFrame = inputDf ? inputDf : 'temp';
    if (!inputDf) {
      codeBlocks.push(`temp = pd.read_csv('${inputUrl}')`);
    }

    // Filters
    const filterQuery = this.getFilterFromTransform(
      spec.transform,
      inputDataFrame
    );
    const filteredDs = filterQuery.length
      ? outputDf
        ? `${outputDf} = ${inputDataFrame}[${filterQuery}]`
        : `${inputDataFrame}[${filterQuery}]`
      : '';
    filteredDs && codeBlocks.push(filteredDs);

    // Aggregators
    const aggregations = this.getAggregations(spec.encoding, outputDf);
    aggregations && codeBlocks.push(aggregations);

    // Axis scales
    const scaling = this.getAxisScaling(spec.encoding, outputDf);
    scaling && codeBlocks.push(scaling);

    // Binning
    const binning = this.getBinning(spec.encoding, outputDf);
    binning && codeBlocks.push(binning);
    const code = codeBlocks.join('\n');
    const isAlphaNum = /\w/;

    return isAlphaNum.test(code) ? code : inputDf;
  }
}
