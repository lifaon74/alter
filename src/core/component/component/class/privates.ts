import { IHostBinding } from '../../host-binding/interfaces';
import { Constructor } from '../../../../classes/factory';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

/** PRIVATES **/

export const COMPONENT_CONSTRUCTOR_PRIVATE = Symbol('component-constructor-private');

export interface IComponentConstructorPrivate {
  hostBindings: IHostBinding<any>[];
}

export interface IComponentConstructorInternal {
  [COMPONENT_CONSTRUCTOR_PRIVATE]: IComponentConstructorPrivate;
}

export function AccessComponentConstructorPrivates(_class: Constructor<HTMLElement>): IComponentConstructorPrivate {
  if (!_class.hasOwnProperty(COMPONENT_CONSTRUCTOR_PRIVATE)) {
    ConstructClassWithPrivateMembers(_class, COMPONENT_CONSTRUCTOR_PRIVATE);
    ((_class as unknown) as IComponentConstructorInternal)[COMPONENT_CONSTRUCTOR_PRIVATE].hostBindings = [];
  }
  return ((_class as unknown) as IComponentConstructorInternal)[COMPONENT_CONSTRUCTOR_PRIVATE];
}
