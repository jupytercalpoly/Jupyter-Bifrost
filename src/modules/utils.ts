export const isFunction = (val: any): val is Function =>
  val && {}.toString.call(val) === '[object Function]';
