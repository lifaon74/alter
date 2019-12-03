import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { IComponentContext } from './interfaces';
import { COMPONENT_CONTEXT_PRIVATE, IComponentContextInternal, IComponentContextPrivate } from './privates';
import { IsObservable } from '@lifaon/observables';

/** FUNCTIONS **/

export function DeepFreeze<T>(value: T): Readonly<T> {
  if (IsObject(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      DeepFreeze((value as any)[key]);
    }
  }
  return value;
}

export function DeepFreezeComponentContextData<T>(value: T): Readonly<T> {
  if (IsObject(value) && !IsObservable(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      DeepFreezeComponentContextData((value as any)[key]);
    }
  }
  return value;
}

export function FreezeComponentContext<TData extends object>(instance: IComponentContext<TData>) {
  const privates: IComponentContextPrivate<TData> = (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE];
  if (privates.frozen) {
    throw new Error(`ComponentContext already frozen`);
  } else {
    DeepFreezeComponentContextData(privates.data);
    privates.frozen = true;
  }
}
