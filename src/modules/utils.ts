import { GraphSpec, EncodingInfo } from '../hooks/bifrost-model';

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
