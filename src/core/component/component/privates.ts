import { IComponentContext } from './context/interfaces';
import { IComponent } from './interfaces';

/** PRIVATES **/

export const COMPONENT_PRIVATE = Symbol('component-private');

export interface IComponentPrivate<TData extends object> {
  context: IComponentContext<TData>;
}

export interface IComponentPrivatesInternal<TData extends object> {
  [COMPONENT_PRIVATE]: IComponentPrivate<TData>;
}

export interface IComponentInternal<TData extends object> extends IComponentPrivatesInternal<TData>, IComponent<TData> {
}
