
export interface IWeakRefConstructor {
  new<G>(target: G): IWeakRef<G>;
}

export interface IWeakRef<G> {
  deref(): G | undefined;
}

export interface IFinalizationRegistryConstructor  {
  new<GHeldValue>(cleanupCallback: (heldValue: GHeldValue) => void): IFinalizationRegistry<GHeldValue>;
}

export interface IFinalizationRegistry<GHeldValue> {
  register(target: any, heldValue: GHeldValue, unregisterToken?: object): void;
  unregister(unregisterToken: object): void;
}

declare const WeakRef: IWeakRefConstructor;
declare const FinalizationRegistry: IFinalizationRegistryConstructor;
