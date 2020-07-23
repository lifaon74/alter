export type TGenericCallback = (...args: any[]) => any;

/**
 * Returns true if GCallback1 supports at least all the arguments of GCallback2
 */
export type TCallbackExtends<GCallback extends TGenericCallback, GReferenceCallback extends TGenericCallback> =
  GCallback extends (...args: infer GArgs1) => any
    ? (
      GReferenceCallback extends (...args: infer GArg2) => any
        ? (
          GArgs1 extends GArg2
            ? (
              ReturnType<GCallback> extends ReturnType<GReferenceCallback> // IsSubSet<ReturnType<GReferenceCallback>, ReturnType<GCallback>>
                ? true
                : false
              )
            : false
          )
        : never
      )
    : never;

// IsSubSet<ReturnType<GReferenceCallback>, ReturnType<GCallback>>
// const b: (((...args: []) => string) extends ((...args: [number]) => void) ? true : false) = null as any;
// const b: TCallbackExtends<(...args: [number]) => (string | void), (...args: [number, ...any[]]) => any> = null as any;
// const b: TCallbackExtends<(...args: [number]) => (string | void), (...args: [number, ...any[]]) => void> = null as any;
// const b: TCallbackExtends<(...args: [number]) => void, (...args: [string, ...any[]]) => void> = null as any;

/**
 * Force GCallback tzo have the same shape as GReferenceCallback
 */
export type TCallbackConstraint<GCallback extends TGenericCallback, GReferenceCallback extends TGenericCallback> =
  TCallbackExtends<GCallback, GReferenceCallback> extends true
    ? GReferenceCallback
    : never;

