
export function ArrayFrom<T>(items: Iterable<T>): T[] {
  return Array.isArray(items) ? items : Array.from(items);
}
