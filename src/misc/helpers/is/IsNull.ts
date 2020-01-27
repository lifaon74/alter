export function IsNull(value: any): value is (null | undefined) {
  return (value === void 0) || (value === null);
}
