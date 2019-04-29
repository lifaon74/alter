import { IComponent, IComponentContext, IComponentOptions } from './interfaces';
import { Constructor, FactoryClass, HasFactoryWaterMark } from '../../../classes/factory';
import { RegisterCustomElement } from '../custom-element/implementation';
import { IsHostBinding } from '../host-binding/implementation';
import { IHostBinding } from '../host-binding/interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { ConstructComponent, disabledComponentInit, OnComponentAttributeChange } from './implementation';


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
  disabledComponentInit.add(_class);
  RegisterCustomElement(_class, options);
  disabledComponentInit.delete(_class);

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

export function ComponentFactory<TBase extends Constructor<HTMLElement>>(superClass: TBase, options: IComponentOptions) {
  const _class = FactoryClass(class Component extends superClass implements IComponent<any> {
    public readonly onCreate: (context: IComponentContext<any>) => void;
    public readonly onInit: () => void;
    public readonly onDestroy: () => void;
    public readonly onConnected: () => void;
    public readonly onDisconnected: () => void;

    constructor(...args: any[]) {
      super(...args.slice(1));
      ConstructComponent(this, options);
    }

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
      OnComponentAttributeChange(this, name, oldValue, newValue);
    }
  })<[]>('Component', IS_COMPONENT_CONSTRUCTOR);


  InitComponentConstructor(_class, options);

  return _class;
}


/**
 * DECORATOR
 * @param options
 */
export function Component(options: IComponentOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    return ComponentFactory<TFunction>(target, options);
  };
}
