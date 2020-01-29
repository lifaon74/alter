
export type TQueryParamsValue = string | number | boolean | null;
export type TQueryParams = Iterable<[string, TQueryParamsValue]>;

/**
 * Writes and applies 'queryParams' into the current browser's url
 *  - keeps existing queryParams not present in 'queryParams'
 */
export function MergeQueryParams(
  queryParams: TQueryParams,
  url: URL = new URL(window.location.href)
): URL {
  const iterator: Iterator<[string, TQueryParamsValue]> = queryParams[Symbol.iterator]();
  let result: IteratorResult<[string, TQueryParamsValue]>;
  while (!(result = iterator.next()).done) {
    const [key, value]: [string, TQueryParamsValue] = result.value;
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

/**
 * Writes and applies 'queryParams' into the current browser's url
 *  - removes all pre-existing queryParams, keeping only 'queryParams'
 */
export function ReplaceQueryParams(queryParams: TQueryParams, url: URL = new URL(window.location.href)): URL {
  url.search = '';
  const iterator: Iterator<[string, TQueryParamsValue]> = queryParams[Symbol.iterator]();
  let result: IteratorResult<[string, TQueryParamsValue]>;
  while (!(result = iterator.next()).done) {
    const [key, value]: [string, TQueryParamsValue] = result.value;
    if (value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}
