import produce from 'immer';
import { GraphSpec } from '../hooks/bifrost-model';
import { isFunction } from './utils';
import { VegaEncoding } from './VegaEncodings';

/**
 *
 * @param graphSpec The Vega Graph Spec that will be the basis for the new filter.
 * @param encoding Encoding variable target of the filter.
 * @param type Type of filter.
 * @param val Filter value to be applied to the graph.
 * @param options additional configuration options.
 * @returns Updated spec.
 */
export function updateSpecFilter<T>(
  graphSpec: GraphSpec,
  encoding: VegaEncoding,
  type: string,
  val: T | ((currentVal: T | null) => T),
  options?: SpecFilterOptions
) {
  const occurrence = options?.occurrence || 1;
  const compoundOperator = options?.compoundOperator || 'or';
  const { field } = graphSpec.encoding[encoding];

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
  const filterFound = index !== -1;
  let value: T;
  if (isFunction(val)) {
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

/**
 * @param occurrence If several of the same type of filters, identifies the desired instance by index. Defaults to first (1).
 */
interface SpecFilterOptions {
  occurrence?: number;
  compoundOperator?: 'and' | 'or' | 'not';
}
