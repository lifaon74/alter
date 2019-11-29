import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { IComponentContext } from './interfaces';
import { COMPONENT_CONTEXT_PRIVATE, IComponentContextInternal, IComponentContextPrivate } from './privates';

/** FUNCTIONS **/

export function DeepFreeze<T>(value: T): Readonly<T> {
  if (IsObject(value)) {
    for (const key of Object.keys(value)) {
      DeepFreeze((value as any)[key]);
    }
  }
  return value;
}

export function FreezeComponentContext<TData extends object>(instance: IComponentContext<TData>) {
  const privates: IComponentContextPrivate<TData> = (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE];
  if (privates.frozen) {
    throw new Error(`ComponentContext already frozen`);
  } else {
    DeepFreeze(privates.data);
    privates.frozen = true;
  }
}
