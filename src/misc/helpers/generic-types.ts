export type TEqualFunction<T> = (a: T, b: T) => boolean;

export function GenericEqual(a: TPrimitive, b: TPrimitive): boolean {
  return a === b;
}

export type TPrimitive =
  number
  | string
  | boolean
  | bigint
  | symbol
  | null
  | undefined;
