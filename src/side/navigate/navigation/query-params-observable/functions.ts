import { ReadonlyMap } from '@lifaon/observables';
import { IQueryParamsChange, TQueryParamChanges } from './types';

/** FUNCTIONS **/

export function GetQueryParamNames(searchParams: URLSearchParams): string[] {
  return Array.from((searchParams as any).keys());
}

/**
 * Returns true if one of the query params (included in 'names' if provided) changed from 'previousURL' to 'currentURL'
 */
export function QueryParamChanged(
  currentURL: URL,
  previousURL: URL = new URL(window.location.origin),
  names: Iterable<string> = GetQueryParamNames(currentURL.searchParams).concat(GetQueryParamNames(previousURL.searchParams)),
): boolean {
  const _names: Set<string> = new Set<string>(names);
  const iterator: Iterator<string> = _names.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    const name: string = result.value;
    if ((previousURL.searchParams.get(name) !== currentURL.searchParams.get(name))) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the list of query params (included in 'names' if provided) which changed from 'previousURL' to 'currentURL'
 */
export function GetQueryParamChanges<TParams extends string>(
  currentURL: URL,
  previousURL: URL = new URL(window.location.origin),
  names: Iterable<TParams> = GetQueryParamNames(currentURL.searchParams).concat(GetQueryParamNames(previousURL.searchParams)) as TParams[],
): TQueryParamChanges<TParams> {
  const _names: Set<TParams> = new Set<TParams>(names);
  const newState: Map<TParams, IQueryParamsChange> = new Map<TParams, IQueryParamsChange>();
  const iterator: Iterator<TParams> = _names.values();
  let result: IteratorResult<TParams>;
  while (!(result = iterator.next()).done) {
    const name: TParams = result.value;
    newState.set(name, {
      previous: previousURL.searchParams.get(name),
      current: currentURL.searchParams.get(name),
    });
  }
  return new ReadonlyMap<TParams, IQueryParamsChange>(newState);
}




