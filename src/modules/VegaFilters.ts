import produce from 'immer';
import { GraphData, GraphSpec } from '../hooks/bifrost-model';
import { isFunction } from './utils';
import { VegaParamPredicate, vegaParamPredicatesList } from './VegaEncodings';

const filterTypes = new Set<string>(vegaParamPredicatesList);

/**
 *
 * @param graphSpec The Vega Graph Spec that will be the basis for the new filter.
 * @param field data field to filter.
 * @param type Type of filter.
 * @param val Filter value to be applied to the graph.
 * @param options additional configuration options.
 * @returns Updated spec.
 */
export function updateSpecFilter<T>(
  graphSpec: GraphSpec,
  field: string,
  type: string,
  val: T | ((currentVal: T | null) => T),
  options?: SpecFilterOptions
) {
  const compoundOperator = options?.compoundOperator || 'or';
  const [compoundIndex, index] = locateFilter(graphSpec, field, type, options);
  const isCompound = type === 'range';

  const filterFound = index !== -1;
  let value: T;
  if (isFunction(val)) {
    let transforms: any;
    if (isCompound) {
      transforms =
        compoundIndex !== -1
          ? graphSpec.transform[compoundIndex].filter[compoundOperator]
          : [];
    } else {
      transforms = graphSpec.transform.map((t) => t.filter);
    }
    const currentVal = filterFound ? transforms[index][type] : null;
    value = val(currentVal);
  } else {
    value = val;
  }
  const newSpec = produce(graphSpec, (gs) => {
    if (isCompound) {
      if (filterFound) {
        // Filter exists in compound
        gs.transform[compoundIndex].filter[compoundOperator][index][type] =
          value;
      } else if (compoundIndex !== -1) {
        // Compound exists but not filter
        gs.transform[compoundIndex].filter[compoundOperator].push({
          field,
          [type]: value,
        });
      } else {
        // Compound doesn't exist. Create the compound.
        gs.transform.push({
          filter: { [compoundOperator]: [{ field, range: value }] },
        });
      }
    } else {
      if (filterFound) {
        // Filter exists
        gs.transform[index].filter[type] = value;
      } else {
        // Create Filter
        gs.transform.push({
          filter: {
            field,
            [type]: value,
          },
        });
      }
    }
  });
  return newSpec;
}

export function deleteSpecFilter(
  graphSpec: GraphSpec,
  field: string,
  type: string,
  options?: SpecFilterOptions & { deleteCompound?: boolean }
) {
  const compoundOperator = options?.compoundOperator || 'or';
  const [compoundIndex, index] = locateFilter(graphSpec, field, type, options);
  const filterFound = index !== -1;
  if (!filterFound) {
    return graphSpec;
  } else {
    return produce(graphSpec, (gs) => {
      if (compoundIndex !== -1) {
        const lastMember =
          gs.transform[compoundIndex].filter[compoundOperator].length === 1;
        if (lastMember || options?.deleteCompound) {
          gs.transform.splice(compoundIndex, 1);
        } else {
          gs.transform[compoundIndex].filter[compoundOperator].splice(index, 1);
        }
      } else {
        gs.transform.splice(index, 1);
      }
    });
  }
}

function locateFilter(
  graphSpec: GraphSpec,
  field: string,
  type: string,
  options?: SpecFilterOptions
): [number, number] {
  const occurrence = options?.occurrence || 1;
  const compoundOperator = options?.compoundOperator || 'or';

  let index = -1;
  let foundCount = 0;
  const isCompound = type === 'range';
  let compoundIndex = -1;
  let transforms: any;

  if (isCompound) {
    compoundIndex = graphSpec.transform.findIndex(
      (t) =>
        compoundOperator in t.filter &&
        t.filter[compoundOperator][0]?.field === field &&
        type in t.filter[compoundOperator][0]
    );
    transforms =
      compoundIndex !== -1
        ? graphSpec.transform[compoundIndex].filter[compoundOperator]
        : [];
  } else {
    transforms = graphSpec.transform.map((t) => t.filter);
  }

  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    if (t.field === field && type in t) {
      foundCount++;
    }
    if (foundCount === occurrence) {
      index = i;
      break;
    }
  }

  return [compoundIndex, index];
}

/**
 * Gets the minimum and maximum bounds for a specific field.
 */
export function getBounds(
  graphData: GraphData,
  field: string
): [number, number] {
  return graphData.reduce(
    (minMax, cur) => {
      const val = cur[field] as number | null;
      if (val === null) {
        return minMax;
      }
      if (minMax[0] > val) {
        minMax[0] = val;
      }
      if (minMax[1] < val) {
        minMax[1] = val;
      }
      return minMax;
    },
    [Infinity, -Infinity]
  );
}

/**
 * Gets all possible categories in a categorical field used in the current graph
 */
export function getCategories(graphData: GraphData, field: string): string[] {
  const categorySet = graphData.reduce((categories, row) => {
    // when data point is NA
    if (row[field] === null) {
      return categories;
    }
    categories.add((row[field] as any).toString());
    return categories;
  }, new Set<string>());

  return Array.from(categorySet);
}

/** Creates a flat array of all filters in a spec.
 */
export function getFilterList(
  spec: GraphSpec
): { field: string; [other: string]: any }[] {
  return spec.transform.flatMap((t) => {
    const compoundOperator =
      'or' in t.filter ? 'or' : 'and' in t.filter ? 'and' : null;
    return compoundOperator ? t.filter[compoundOperator] : t.filter;
  });
}

/**
 * Turns filter into a human readable string.
 * @param filter A single filter config object from the vega transform array
 * @returns array of string representation
 */
export function stringifyFilter(filter: {
  field: string;
  [other: string]: any;
}): string[] {
  return Object.keys(filter)
    .filter((k) => filterTypes.has(k))
    .map((type) => {
      let categoriesString: string;
      switch (type as VegaParamPredicate) {
        case 'gte':
          return '> ' + filter.gte.toFixed(2);
        case 'lte':
          return '< ' + filter.lte.toFixed(2);
        case 'range':
          return `${filter.range[0].toFixed(2)} - ${filter.range[1].toFixed(
            2
          )}`;
        case 'oneOf':
          categoriesString = filter.oneOf.join(', ');
          return categoriesString.length > 20
            ? categoriesString.slice(0, 20) + '...'
            : categoriesString;

        default:
          return '';
      }
    });
}

/**
 * @param occurrence If several of the same type of filters, identifies the desired instance by index. Defaults to first (1).
 * If the occurrence is not found, the filter value will be appended to the compound group.
 */
interface SpecFilterOptions {
  occurrence?: number;
  compoundOperator?: 'and' | 'or' | 'not';
}
