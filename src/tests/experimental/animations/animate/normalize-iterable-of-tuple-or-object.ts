import { IsObject } from '../../../../misc/helpers/is/IsObject';

export type TPropertyKeys = PropertyKey[];
export type TObjectFromKeys<GKeys extends TPropertyKeys> = Record<GKeys[number], any>;
export type TTupleOrObject<GKeys extends TPropertyKeys, GObject extends TObjectFromKeys<GKeys>> =
  GObject
  | TTupleFromInterface<GKeys, GObject>;

export type TTupleFromInterface<GKeys extends TPropertyKeys, GObject extends TObjectFromKeys<GKeys>> = {
  [GKey in keyof GKeys]: GKeys[GKey] extends keyof GObject ? GObject[GKeys[GKey]] : never;
};

export type TIterableOfTupleOrObject<GKeys extends TPropertyKeys, GObject extends TObjectFromKeys<GKeys>> = Iterable<TTupleOrObject<GKeys, GObject>>;

// const a: TTupleFromInterface<['a', 'b'], { a: string; b: number }> = null as any;
// const n: TTupleFromInterface<(keyof ({ a: string; b: number }))[], { a: string; b: number }> = null as any;

export function IterateOverIterableOfTupleOrObject<GKeys extends TPropertyKeys, GObject extends TObjectFromKeys<GKeys>>(
  keys: GKeys,
  iterable: TIterableOfTupleOrObject<GKeys, GObject>,
  callback: (item: GObject) => void
): void {
  const keysLength: number = keys.length;
  const iterator: Iterator<TTupleOrObject<GKeys, GObject>> = iterable[Symbol.iterator]();
  let result: IteratorResult<TTupleOrObject<GKeys, GObject>>;
  let index: number = 0;
  while (!(result = iterator.next()).done) {
    const item: TTupleOrObject<GKeys, GObject> = result.value;
    if (Array.isArray(item)) {
      if (item.length === keysLength) {
        const _item: GObject = {} as GObject;
        for (let i: number = 0; i < keysLength; i++) {
          _item[keys[i]] = item[i];
        }
        callback(_item);
      } else {
        throw new RangeError(`At index ${ index }: expected tuple with a length of ${ keysLength }`);
      }
    } else if (IsObject(item)) {
      const _item: GObject = {} as GObject;
      for (let i: number = 0; i < keysLength; i++) {
        const key: PropertyKey = keys[i];
        if (key in item) {
          _item[key] = item[key];
        } else {
          throw new TypeError(`At index ${ index }: object must have the property '${ String(key) }'`);
        }
      }
      callback(_item);
    } else {
      throw new TypeError(`At index ${ index }: expected array or object`);
    }
    index++;
  }
}

export function NormalizeIterableOfTupleOrObject<GKeys extends TPropertyKeys, GObject extends TObjectFromKeys<GKeys>>(
  keys: GKeys,
  iterable: TIterableOfTupleOrObject<GKeys, GObject>
): GObject[] {
  const items: GObject[] = [];
  IterateOverIterableOfTupleOrObject(keys, iterable, (item: GObject) => {
    items.push(item);
  });
  return items;
}
