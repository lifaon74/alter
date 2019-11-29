import { IComponentContext } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { COMPONENT_CONTEXT_PRIVATE, IComponentContextInternal, IComponentContextPrivate } from './privates';
import { INotificationsObservableContext, NotificationsObservable } from '@lifaon/observables';
import { IComponentContextAttributeListenerKeyValueMap } from './types';

/** CONSTRUCTOR **/

let ALLOW_COMPONENT_CONTEXT_CONSTRUCT: boolean = false;

export function AllowComponentContextConstruct(allow: boolean): void {
  ALLOW_COMPONENT_CONTEXT_CONSTRUCT = allow;
}

export function ConstructComponentContext<TData extends object>(
  instance: IComponentContext<TData>
): void {
  if (ALLOW_COMPONENT_CONTEXT_CONSTRUCT) {
    ConstructClassWithPrivateMembers(instance, COMPONENT_CONTEXT_PRIVATE);
    const privates: IComponentContextPrivate<TData> = (instance as IComponentContextInternal<TData>)[COMPONENT_CONTEXT_PRIVATE];
    // privates.data = void 0;
    privates.frozen = false;
    privates.attributeListener = new NotificationsObservable((_context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>) => {
      privates.context = _context;
    });
  } else {
    throw new TypeError(`Illegal constructor`);
  }
}
