/** TYPES **/

export type TPathMatcherParams = ReadonlyMap<string, string>;

export interface IPathMatcherResult {
  readonly params: TPathMatcherParams;
  readonly remaining: string;
}
