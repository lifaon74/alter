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

// TODO methods

/** CLASS **/

/* PRIVATE */
export class ComponentContext<TData extends object> implements IComponentContext<TData> {

  protected constructor() {
    ConstructComponentContext(this);
  }

  get data(): TData {
    return ((this as unknown) as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].data;
  }

  set data(data: TData) {
    if (((this as unknown) as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].frozen) {
      throw new SyntaxError(`Cannot set data after the context is frozen`);
    } else {
      ((this as unknown) as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].data = data;
    }
  }

  get frozen(): boolean {
    return ((this as unknown) as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].frozen;
  }

  get attributeListener(): INotificationsObservable<IComponentContextAttributeListenerKeyValueMap> {
    return ((this as unknown) as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE].attributeListener;
  }
}

