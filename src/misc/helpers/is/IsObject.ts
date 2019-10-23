export function IsObject<T extends object = object>(value: any): value is T {
  return (typeof value === 'object') && (value !== null);
}
