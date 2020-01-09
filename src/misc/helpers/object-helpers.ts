
export function ObjectPathGet<T>(obj: object, path: PropertyKey[]): T {
  for (let i = 0, l = path.length; i < l; i++) {
    obj = (obj as any)[path[i]];
  }
  return obj as any;
}

export function ObjectPathSet<T>(obj: object, path: PropertyKey[], value: T): void {
  const last: number = path.length - 1;
  for (let i = 0; i < last; i++) {
    obj = (obj as any)[path[i]];
  }
  (obj as any)[last] = value;
}

function ObjectPathDelete(obj: object, path: PropertyKey[]): boolean {
  const last: number = path.length - 1;
  for (let i = 0; i < last; i++) {
    obj = (obj as any)[path[i]];
  }
  return delete ((obj as any)[last]);
}

export function ObjectPathExists(obj: object, path: PropertyKey[]): boolean {
  for (let i = 0, l = path.length; i < l; i++) {
    if (path[i] in obj) {
      obj = (obj as any)[path[i]];
    } else {
      return false;
    }
  }
  return true;
}

export function GetPropertyDescriptor<T>(target: object | null, propertyName: PropertyKey): TypedPropertyDescriptor<T> | undefined {
  while (target !== null) {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target, propertyName);
    if (descriptor === void 0) {
      target = Object.getPrototypeOf(target);
    } else {
      return descriptor;
    }
  }
  return void 0;
}
