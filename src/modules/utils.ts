import produce from 'immer';
import { GraphSpec, EncodingInfo, GraphProps } from '../hooks/bifrost-model';

export const isFunction = (val: any): val is Function =>
  val && {}.toString.call(val) === '[object Function]';

export function hasDuplicateField(
  graphSpec: GraphSpec,
  field: string
): boolean {
  const countFieldUsage = Object.values(graphSpec.encoding).filter(
    (encodingInfo: EncodingInfo) => encodingInfo.field === field
  ).length;
  return countFieldUsage > 1;
}

/**
 *
 * @param val numerical value to round
 * @param decimalPlaces number of digits after the decimal
 */
export function round(val: number, decimalPlaces: number) {
  const s = 10 ** decimalPlaces;
  return Math.floor(s * val) / s;
}

/**
 *
 * @param spec vega lite graph spec
 * @param prop property of vega lite graph spec
 * @param val new value for a given property
 * @returns
 */
export function changeSpecProp(spec: GraphSpec, prop: GraphProps, val: any) {
  return produce(spec, (gs) => {
    (gs as any)[prop] = val;
  });
}
