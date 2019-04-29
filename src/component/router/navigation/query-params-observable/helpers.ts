
export interface IQueryParams {
  [key: string]: (string | number | boolean | null);
}

export function MergeQueryParams(queryParams: IQueryParams, url: URL = new URL(window.location.href)): URL {
  for (const [key, value] of Object.keys(queryParams)) {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export function ReplaceQueryParams(queryParams: IQueryParams, url: URL = new URL(window.location.href)): URL {
  url.search = '';
  for (const [key, value] of Object.keys(queryParams)) {
    if (value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}
