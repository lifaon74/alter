
export function IsArrayIndex(propertyName: PropertyKey): number {
  if (typeof propertyName === 'symbol') {
    return -1;
  } else if (typeof propertyName === 'string') {
    propertyName = Number(propertyName);
  }

  return (Number.isInteger(propertyName) && (propertyName >= 0)) ? propertyName : -1;
}

export function PatchArrayProxy(target: any[], propertyKey: PropertyKey, value: any, receiver: any[]): void {
  if (propertyKey === 'length') {
    if (value > target.length) {
      for (let i = target.length; i < value; i++) {
        receiver[i] = void 0;
      }
    } else if (value < target.length) {
      for (let i = value; i < target.length; i++) {
        delete receiver[i];
      }
    }
    // for (let i = Math.min(target.length, value), l = Math.max(target.length, value); i < l; i++) {
    //   receiver[i] = void 0;
    // }
  } else {
    const index: number = IsArrayIndex(propertyKey);
    for (let i = target.length; i < index; i++) {
      receiver[i] = void 0;
    }
  }
}
