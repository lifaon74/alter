import { IComponentOptions } from '../types';
import { IComponent, IComponentTypedConstructor } from '../interfaces';
import { IComponentContext } from '../context/interfaces';
import { ConstructComponent } from '../constructor';
import { EmitAttributeChangeForComponent, EmitConnectedForComponent, EmitDisconnectedForComponent } from '../functions';
import { InitComponentConstructor } from './functions';
import { Constructor, HasFactoryWaterMark, MakeFactory, TMakeFactoryCreateSuperClass } from '@lifaon/class-factory';

/** CONSTRUCTOR **/

const IS_COMPONENT_CONSTRUCTOR = Symbol('is-component-constructor');

export function IsComponentConstructor(value: any): boolean {
  return (typeof value === 'function')
    && HasFactoryWaterMark(value, IS_COMPONENT_CONSTRUCTOR);
}

/** PURE FACTORY **/

function PureComponentFactory<TBase extends Constructor<HTMLElement>>(superClass: TBase, options: IComponentOptions) {
  type TData = any;
  const _class = class Component extends superClass implements IComponent<TData> {
    public readonly onCreate: (context: IComponentContext<any>) => void;
    public readonly onInit: () => void;
    public readonly onDestroy: () => void;
    public readonly onConnected: () => void;
    public readonly onDisconnected: () => void;

    constructor(...args: any[]) {
      super(...args.slice(1));
      ConstructComponent<TData>(this, options);
    }

    connectedCallback(): void {
      EmitConnectedForComponent<TData>(this);
    }

    disconnectedCallback(): void {
      EmitDisconnectedForComponent<TData>(this);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
      EmitAttributeChangeForComponent(this, name, oldValue, newValue);
    }
  };

  InitComponentConstructor(_class, options);

  return _class;
}

/** FACTORY **/

export function ComponentFactory<TBase extends Constructor<HTMLElement>, TData extends object = object>(superClass: TBase, options: IComponentOptions) {
  type TSuperClasses = [];

  return MakeFactory<IComponentTypedConstructor<TData>, TSuperClasses, TBase>((superClass: TMakeFactoryCreateSuperClass<TSuperClasses>): TMakeFactoryCreateSuperClass<TSuperClasses> => {
    return PureComponentFactory<TMakeFactoryCreateSuperClass<TSuperClasses>>(superClass, options);
  }, [], superClass, {
    name: 'Component',
    waterMarks: [IS_COMPONENT_CONSTRUCTOR]
  });
}
