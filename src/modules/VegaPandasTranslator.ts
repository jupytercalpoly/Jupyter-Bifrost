
import { vegaParamPredicatesList, VegaParamPredicate, VegaAggregation } from "./VegaEncodings";
import { GraphSpec } from "../hooks/bifrost-model";



const DF = "$df"
const filterTypes = new Set<string>(vegaParamPredicatesList)

interface AggFunc {
    (encoding: any, encodings: any[]): string
}
const vegaAggToPd: {[vegaAgg: string]: string | AggFunc} = {
    'count': "count",
  'valid': (encoding , encodings) => "TODO: Not implemented",
  'values': (encoding , encodings) => "TODO: Not implemented",
  // Look at this one again...
  'missing': (encoding , encodings) => `$df = $df[pd.isnull($df["${encoding.field}]")]`,
  // Not sure if we should groupby on this one.
  'distinct': (encoding , encodings) => [`cols = $df.columns.to_list()`,
  `$df = $df.drop_duplicates([${encodings.map(encoding => `${encoding.field}`)}])`].join("\n"),
  'sum': "sum",
  'product': "prod",
  'mean': "mean",
  'variance' : 'var',
  'variancep': (encoding , encodings) => "TODO: Not implemented",
  'stdev': "std",
  'stdevp': (encoding , encodings) => "TODO: Not implemented",
  'stderr': (encoding , encodings) => "TODO: Not implemented",
  'median': "median",
  'q1': (encoding , encodings) => "TODO: Not implemented",
  'q3': (encoding , encodings) => "TODO: Not implemented",
  'ci0': (encoding , encodings) => "TODO: Not implemented",
  'ci1': (encoding , encodings) => "TODO: Not implemented",
  'min': "min",
  'max': "max",
  'argmin': (encoding , encodings) => "TODO: Not implemented",
  'argmax': (encoding , encodings) => "TODO: Not implemented",
}


export default class VegaPandasTranslator {

    private getQueryFromFilter(filterConfig: any) {
        return Object.keys(filterConfig).filter(key => filterTypes.has(key)).map((filterType) => {
            let query: string;
            switch (filterType as VegaParamPredicate) {
                case "gte":
                    query = `(${DF}['${filterConfig.field}'] >= ${filterConfig.gte})`
                    break;
                case "lte":
                    query = `(${DF}['${filterConfig.field}'] <= ${filterConfig.lte})`
                    break;
                case "range":
                    // Expects number range like {range: [0, 5]}
                    query = `(${DF}['${filterConfig.field}'] >= ${filterConfig.gte}) & (${DF}['${filterConfig.field}'] <= ${filterConfig.lte})`
                    break;
                case "oneOf":
                    query = `(${DF}['${filterConfig.field}'].isin([${filterConfig.oneOf.toString()}]))`
                    break;
            
                default:
                    query = ""
                    break;
            }
            return query;
        }).join("&")
    }

    private getAggregations(encodings: GraphSpec["encoding"]) {
        const encodingVals = Object.values(encodings)
        return encodingVals.filter(encoding => encoding.hasOwnProperty("aggregate")).map((encoding) => {
            let query: string;
            const agg = vegaAggToPd[encoding.aggregate as VegaAggregation];
            if (typeof agg === "string") {
                query = 
                [`group_fields = $df.columns.to_list()`,
                `group_fields.remove("${encoding.field}")`,
                `$df = $df.join($df.groupby(group_fields).agg("${agg}")["${encoding.field}"], on=group_fields, rsuffix=" ${agg}")`].join("\n")
            } else {
                query = agg(encoding, encodingVals);
            }
            return query;
        }).join("\n")
    }
        


    convertSpecToCode(spec: GraphSpec) {
        // Filters
        const filterQuery = spec.transform.map((filterObj) =>  this.getQueryFromFilter(filterObj.filter)).join("&")
        const filteredDs = filterQuery.length ?  `$df = $df[${filterQuery}]` : ""
        // Aggregators
        const aggregations = this.getAggregations(spec.encoding)
        // Check 
        let code = [
            filteredDs, aggregations
        ].join("\n")
        return code
    }



}