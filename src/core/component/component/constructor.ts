import { Constructor } from '../../../classes/factory';
import { IComponent} from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { COMPONENT_PRIVATE, IComponentInternal, IComponentPrivate } from './privates';
import { NewObservableContext } from './context/implementation';
import { InitComponent } from './functions';
import { IComponentOptions } from './types';

/** CONSTRUCTOR **/

export const DISABLED_COMPONENT_INIT: WeakSet<Constructor<IComponent<any>>> = new WeakSet<Constructor<IComponent<any>>>();

export function ConstructComponent<TData extends object>(
  instance: IComponent<TData>,
  options: IComponentOptions
): void {
  ConstructClassWithPrivateMembers(instance, COMPONENT_PRIVATE);
  const privates: IComponentPrivate<TData> = (instance as IComponentInternal<TData>)[COMPONENT_PRIVATE];
  privates.context = NewObservableContext<TData>();

  if (!DISABLED_COMPONENT_INIT.has(instance.constructor as any)) {
    InitComponent<TData>(instance, options);
  }
}
