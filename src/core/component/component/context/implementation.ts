import { IComponentContext, IComponentContextConstructor } from './interfaces';
import { AllowComponentContextConstruct, ConstructComponentContext } from './constructor';
import { COMPONENT_CONTEXT_PRIVATE, IComponentContextInternal } from './privates';
import { INotificationsObservable } from '@lifaon/observables';
import { IComponentContextAttributeListenerKeyValueMap } from './types';

/** NEW **/

export function NewObservableContext<TData extends object>(): IComponentContext<TData> {
  AllowComponentContextConstruct(true);
  const context: IComponentContext<TData> = new (ComponentContext as IComponentContextConstructor)<TData>();
  AllowComponentContextConstruct(false);
  return context;
}

/** METHODS **/

/* GETTERS/SETTERS */

export function ComponentContextGetData<TData extends object>(instance: IComponentContext<TData>): TData {
  return (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].data;
}

export function ComponentContextSetData<TData extends object>(instance: IComponentContext<TData>, data: TData): void {
  if ((instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].frozen) {
    throw new Error(`Cannot set data after the context is frozen`);
  } else {
    (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].data = data;
  }
}

export function ComponentContextGetFrozen<TData extends object>(instance: IComponentContext<TData>): boolean {
  return (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].frozen;
}

export function ComponentContextGetAttributeListener<TData extends object>(instance: IComponentContext<TData>): INotificationsObservable<IComponentContextAttributeListenerKeyValueMap> {
  return (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].attributeListener;
}

/** CLASS **/

/* PRIVATE */
export class ComponentContext<TData extends object> implements IComponentContext<TData> {

  protected constructor() {
    ConstructComponentContext(this);
  }

  get data(): TData {
    return ComponentContextGetData<TData>(this);
  }

  set data(data: TData) {
    ComponentContextSetData<TData>(this, data);
  }

  get frozen(): boolean {
    return ComponentContextGetFrozen<TData>(this);
  }

  get attributeListener(): INotificationsObservable<IComponentContextAttributeListenerKeyValueMap> {
    return ComponentContextGetAttributeListener<TData>(this);
  }
}

