
export type TMapKeys<TMap extends Map<any, any>> = TMap extends Map<infer TKeys, any> ? TKeys : never;
export type TMapValues<TMap extends Map<any, any>> = TMap extends Map<any, infer TValues> ? TValues : never;

export type TMergeMapKeys<TMaps extends Map<any, any>[]> = {
  [TKey in Extract<keyof TMaps, number>]: TMapKeys<TMaps[TKey]>;
}[number];


export type TMergeMapValues<TMaps extends Map<any, any>[]> = {
  [TKey in Extract<keyof TMaps, number>]: TMapValues<TMaps[TKey]>;
}[number];

export type TMergeMap<TMaps extends Map<any, any>[]> = Map<TMergeMapKeys<TMaps>, TMergeMapValues<TMaps>>;

/**
 * Merges N maps into the first map
 */
export function MergeMaps<TMaps extends Map<any, any>[]>(...maps: TMaps): TMergeMap<TMaps> {
  if (maps.length === 0) {
    throw new Error(`Expects at least one argument`);
  } else {
    // const mergedMap: TMergeMap<TMaps> = new Map<TMergeMapKeys<TMaps>, TMergeMapValues<TMaps>>();
    const mergedMap: TMergeMap<TMaps> = maps[0];
    for (let i = 1, l = maps.length; i < l; i++) {
      const map: TMergeMap<TMaps> = maps[i];
      const iterator: Iterator<[TMergeMapKeys<TMaps>, TMergeMapValues<TMaps>]> = map.entries();
      let result: IteratorResult<[TMergeMapKeys<TMaps>, TMergeMapValues<TMaps>]>;
      while (!(result = iterator.next()).done) {
        mergedMap.set(result.value[0], result.value[1]);
      }
    }
    return mergedMap;
  }
}
