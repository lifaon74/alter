
export interface IPathMatcherParams {
  [key: string]: string;
}

export interface IPathMatcherResult {
  params: IPathMatcherParams;
  remaining: string;
}

export interface IPathMatcherConstructor {
  new(path: string): IPathMatcher;
}

export interface IPathMatcher {
  readonly path: string;

  exec(path: string): IPathMatcherResult | null;
}

