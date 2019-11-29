import { IComponent, IComponentTypedConstructor } from '../interfaces';
import {
  Constructor, HasFactoryWaterMark, MakeFactory, TMakeFactoryCreateSuperClass
} from '../../../../classes/factory';
import { IsHostBinding } from '../../host-binding/implementation';
import { IHostBinding } from '../../host-binding/interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { RegisterCustomElement } from '../../custom-element/functions';
import { IComponentContext } from '../context/interfaces';
import { ConstructComponent, DISABLED_COMPONENT_INIT } from '../constructor';
import { EmitAttributeChangeForComponent } from '../functions';
import { IComponentOptions } from '../types';

/** PRIVATES **/

// TODO refactor file structure

export const COMPONENT_CONSTRUCTOR_PRIVATE = Symbol('component-constructor-private');

export interface IComponentConstructorPrivate {
  hostBindings: IHostBinding[];
}

export interface IComponentConstructorInternal {
  [COMPONENT_CONSTRUCTOR_PRIVATE]: IComponentConstructorPrivate;
}


const IS_COMPONENT_CONSTRUCTOR = Symbol('is-component-constructor');

export function IsComponentConstructor(value: any): boolean {
  return (typeof value === 'function')
    && HasFactoryWaterMark(value, IS_COMPONENT_CONSTRUCTOR);
}


export function AccessComponentConstructorPrivates(_class: Constructor<HTMLElement>): IComponentConstructorPrivate {
  if (!(COMPONENT_CONSTRUCTOR_PRIVATE in _class)) {
    ConstructClassWithPrivateMembers(_class, COMPONENT_CONSTRUCTOR_PRIVATE);
    ((_class as unknown) as IComponentConstructorInternal)[COMPONENT_CONSTRUCTOR_PRIVATE].hostBindings = [];
  }
  return ((_class as unknown) as IComponentConstructorInternal)[COMPONENT_CONSTRUCTOR_PRIVATE];
}

export function InitComponentConstructor(_class: Constructor<HTMLElement>, options: IComponentOptions): void {
  // RegisterCustomElement may create an instance of the component, so we need to disabled the init
  DISABLED_COMPONENT_INIT.add(_class);
  RegisterCustomElement(_class, options);
  DISABLED_COMPONENT_INIT.delete(_class);

  const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(_class);

  if (Array.isArray(options.host)) {
    for (let i = 0, l = options.host.length; i < l; i++) {
      if (IsHostBinding(options.host[i])) {
        privates.hostBindings.push(options.host[i]);
      } else {
        throw new TypeError(`Expected HostBinding at index ${ i } of options.host`);
      }
    }
  } else if (options.host !== void 0) {
    throw new TypeError(`Expected array as options.host`);
  }
}

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

    get isConnected(): boolean {
      return document.contains(this);
    }

    // TODO verify if it works when this element is added to a parent detached from the DOM, and then attached to the DOM
    connectedCallback(): void {
      if ((typeof this.onConnected === 'function') && this.isConnected) {
        this.onConnected();
      }
    }

    disconnectedCallback(): void {
      if ((typeof this.onDisconnected === 'function') && !this.isConnected) {
        this.onDisconnected.call(this);
      }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
      EmitAttributeChangeForComponent(this, name, oldValue, newValue);
    }
  };

  InitComponentConstructor(_class, options);

  return _class;
}


export function ComponentFactory<TBase extends Constructor<HTMLElement>, TData extends object = object>(superClass: TBase, options: IComponentOptions) {
  type TSuperClasses = [];

  return MakeFactory<IComponentTypedConstructor<TData>, TSuperClasses, TBase>((superClass: TMakeFactoryCreateSuperClass<TSuperClasses>): TMakeFactoryCreateSuperClass<TSuperClasses> => {
    return PureComponentFactory<TMakeFactoryCreateSuperClass<TSuperClasses>>(superClass, options);
  }, [], superClass, {
    name: 'Component',
    waterMarks: [IS_COMPONENT_CONSTRUCTOR]
  });
}


/**
 * DECORATOR (CLASS)
 */
export function Component(options: IComponentOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    return ComponentFactory<TFunction>(target, options);
  };
}
