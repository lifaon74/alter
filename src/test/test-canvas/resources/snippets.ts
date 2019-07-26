export type SortCallback<T> = (a: T, b: T) => number;

// interface SortIndexesEntry<T> {
//   index: number;
//   value: T;
// }
// export function SortIndexes<T>(array: T[], sortFunction: (a: T, b: T) => number): number[] {
//   return array
//     .map((value: T, index: number) => ({ index: index, value: value} as SortIndexesEntry<T>))
//     .sort((a: SortIndexesEntry<T>, b: SortIndexesEntry<T>) => sortFunction(a.value, b.value))
//     .map((entry: SortIndexesEntry<T>) => entry.index);
// }

export const SORT_ANY: SortCallback<any> = (a: any, b: any) => {
  return  (a < b) ? -1 : ((a > b) ? +1 : 0)
};
export const SORT_NUMBER_ASK: SortCallback<number> = (a: number, b: number) => (a - b);
export const SORT_NUMBER_DESK: SortCallback<number> = (a: number, b: number) => (b - a);

export const DEFAULT_SORT_SYMBOL = Symbol.for('default-sort');

export interface Sortable<T> extends ArrayLike<T> {
  sort(sortFunction?: SortCallback<T>): any;
  [DEFAULT_SORT_SYMBOL]?: SortCallback<T>;
}


export function GetBestDefaultSortFunction<T>(array: Sortable<T>): SortCallback<T> {
  if (DEFAULT_SORT_SYMBOL in array) {
    return array[DEFAULT_SORT_SYMBOL];
  } else if (ArrayBuffer.isView(array)) {
    return SORT_NUMBER_ASK as any as SortCallback<T>;
  } else {
    return SORT_ANY;
  }
}

export function GetAndStoreBestDefaultSortFunction<T>(array: Sortable<T>): SortCallback<T> {
  const callback: SortCallback<T> = GetBestDefaultSortFunction(array);
  if (!(DEFAULT_SORT_SYMBOL in array)) {
    array[DEFAULT_SORT_SYMBOL] = callback;
  }
  return callback;
}


/**
 * Returns a list of indexes from 'array' in such a manner than array[indexes[i]] is sorted
 * @param array
 * @param sortFunction
 */
export function SortIndexes<T>(array: Sortable<T>, sortFunction: SortCallback<T> = GetAndStoreBestDefaultSortFunction<T>(array)): number[] {
  const length: number = array.length;
  const indices: number[] = new Array(length);
  for (let i = 0; i < length; ++i) {
    indices[i] = i
  }
  return indices.sort((a: number, b: number) => sortFunction(array[a], array[b]));
}

/**
 * Returns a list of indexes from 'array' in such a manner than array[indexes[i]] is sorted.
 * Returns Uint32Array
 * @param array
 * @param sortFunction
 */
export function SortIndexesUint32<T>(array: Sortable<T>, sortFunction: SortCallback<T> = GetAndStoreBestDefaultSortFunction<T>(array)): Uint32Array {
  const length: number = array.length;
  const indices: Uint32Array = new Uint32Array(length);
  for (let i = 0; i < length; ++i) {
    indices[i] = i
  }
  return indices.sort((a: number, b: number) => sortFunction(array[a], array[b]));
}
