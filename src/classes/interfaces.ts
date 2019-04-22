export type TArrayBufferView = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

export interface Constructor<Instance = any, Args extends any[] = any[]> extends Function {
  new (...args: Args): Instance;
}
