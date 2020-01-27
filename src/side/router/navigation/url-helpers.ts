export interface URLEqualsOptions {
  strictString?: boolean;
  strictOrigin?: boolean;
}

export function URLEquals(url1: string, url2: string, { strictString = true, strictOrigin = true }: URLEqualsOptions = {}): boolean {
  if (!strictOrigin) {
    url1 = new URL(url1, window.location.origin).href;
    url2 = new URL(url2, window.location.origin).href;
  }
  if (!strictString) {
    url1 = decodeURI(url1);
    url2 = decodeURI(url2);
  }
  return (url1 === url2);
}


export function CloneURL(url: URL): URL {
  return new URL(url.href);
}

export function NormalizeURL(url: string): string {
  return new URL(url, window.location.origin).href;
}
