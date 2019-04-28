import { ITemplate } from '../../../template/interfaces';
import { NodeStateObservableOf } from '../../../custom-node/node-state-observable/implementation';
import { IStyle } from '../../../style/interfaces';
import { GetNodeDOMState } from '../../../custom-node/node-state-observable/mutations';
import { RegisterCustomElement } from '../custom-element/implementation';
import {
  INotificationsObservable, INotificationsObservableContext, NotificationsObservable
} from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { Constructor, FactoryClass, HasFactoryWaterMark } from '../../../classes/factory';
import {
  IComponent, IComponentContext, IComponentContextAttributeListenerKeyValueMap, IComponentOptions
} from './interfaces';
import { IHostBinding } from '../host-binding/interfaces';
import { IsHostBinding } from '../host-binding/implementation';


export const COMPONENT_PRIVATE = Symbol('component-private');

export interface IComponentPrivate {
  context: IComponentContext;
}

export interface IComponentInternal extends IComponent {
  [COMPONENT_PRIVATE]: IComponentPrivate;
}


export const disabledComponentInit: WeakSet<Constructor<IComponent>> = new WeakSet<Constructor<IComponent>>();
export function ConstructComponent(component: IComponent, options: IComponentOptions): void {
  ConstructClassWithPrivateMembers(component, COMPONENT_PRIVATE);
  (component as IComponentInternal)[COMPONENT_PRIVATE].context = new ComponentContext();

  if (!disabledComponentInit.has(component.constructor as any)) {
    InitComponent(component, options);
  }
}

export function InitComponent(component: IComponent, options: IComponentOptions): void {
  if (typeof component.onCreate === 'function') {
    component.onCreate.call(component, (component as IComponentInternal)[COMPONENT_PRIVATE].context);
  }

  const constructorPrivates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(component.constructor as Constructor<IComponent>);

  Promise.all([
    Promise.all(
      constructorPrivates.hostBindings.map((hostBinding: IHostBinding) => hostBinding.resolve(component))
    ),
    LoadComponentTemplate(component, options.template),
    LoadComponentStyle(component, options.style),
  ]).then(() => {
    if ((typeof component.onInit === 'function') && (GetNodeDOMState(component) === 'attached')) {
      component.onInit.call(component);
    }
  });

  const destroyObserver = NodeStateObservableOf(component)
    .addListener('destroy', () => {
      destroyObserver.disconnect();
      if (typeof component.onDestroy === 'function') {
        component.onDestroy.call(component);
      }
    }).activate();
}

export function LoadComponentTemplate(component: IComponent, template?: Promise<ITemplate> | ITemplate): Promise<void> {
  if (template) {
    return Promise.resolve(template)
      .then((template: ITemplate) => {
        return template.insert((component as IComponentInternal)[COMPONENT_PRIVATE].context.data, component, 'clear');
      });
  } else {
    return Promise.resolve();
  }
}

export function LoadComponentStyle(component: IComponent, style?: Promise<IStyle> | IStyle): Promise<any> {
  if (style) {
    return Promise.resolve(style)
      .then((style: IStyle) => {
        return style.insert(component);
      });
  } else {
    return Promise.resolve();
  }
}

export function OnComponentAttributeChange(component: IComponent, name: string, oldValue: string, newValue: string): void {
  const context = ((component as IComponentInternal)[COMPONENT_PRIVATE].context as any)._context;
  context.dispatch(name, { previous: oldValue, current: newValue }); // TODO improve
}

/*------------------------------*/

export class ComponentContext implements IComponentContext {
  public readonly data: any;
  public readonly attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;

  private _context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>;

  constructor() {
    this.data = {};
    this.attributeListener = new NotificationsObservable((context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>) => {
      this._context = context;
    });
  }
}


/*------------------------------*/


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
        throw new TypeError(`Expected HostBinding at index ${i} of options.host`);
      }
    }
  } else if (options.host !== void 0) {
    throw new TypeError(`Expected array as options.host`);
  }
}

export function ComponentFactory<TBase extends Constructor<HTMLElement>>(superClass: TBase, options: IComponentOptions) {
  const _class = FactoryClass(class Component extends superClass implements IComponent {
    public readonly onCreate: (context: IComponentContext) => void;
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


