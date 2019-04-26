import { ITemplate } from '../template/interfaces';
import { NodeStateObservableOf } from '../custom-node/node-state-observable/implementation';
import { IStyle } from '../style/interfaces';
import { GetNodeDOMState } from '../custom-node/node-state-observable/mutations';
import { AttributeChangedCallback, ConnectedCallBack, DisconnectedCallBack } from './custom-element/interfaces';
import { ICustomElementOptions, RegisterCustomElement } from './custom-element/implementation';
import { INotificationsObservable, INotificationsObservableContext, NotificationsObservable } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../misc/helpers/ClassWithPrivateMembers';
import { Constructor } from '../classes/factory';


// export type TComponentConstructorArgs = [IComponentOptions];

export interface IComponent extends HTMLElement {
  // readonly data: any;
  readonly onCreate?: (context: IComponentContext) => void;
  readonly onInit?: () => void;
  readonly onDestroy?: () => void;
  readonly onConnected?: () => void;
  readonly onDisconnected?: () => void;
}

export interface IComponentOptions extends ICustomElementOptions {
  template?: Promise<ITemplate> | ITemplate;
  style?: Promise<IStyle> | IStyle;
}

export interface OnCreate {
  onCreate(context: IComponentContext): void;
}

export interface OnInit {
  onInit(): void;
}

export interface OnDestroy {
  onDestroy(): void;
}

export interface OnConnected {
  onConnected(): void;
}

export interface OnDisconnected {
  onDisconnected(): void;
}



export interface IComponentContext {
  readonly data: any;
  readonly attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
}

export interface IComponentContextAttributeListenerKeyValueMap {
  [key: string]: IAttributeChange<any>;
}

export interface IAttributeChange<T> {
  previous: T;
  current: T;
}



/* ---------------------- */

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

  Promise.all([
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

// export function ComponentFactory<TBase extends Constructor<HTMLElement>>(superClass: TBase, options: IComponentOptions) {
//   return FactoryClass(class Component extends superClass implements IComponent {
//     public readonly data: any;
//     public readonly attributeListener: INotificationsObservable<string, any>;
//
//     public readonly onInit: () => void;
//     public readonly onDestroy: () => void;
//     public readonly onConnected: () => void;
//     public readonly onDisconnected: () => void;
//
//     constructor(...args: any[]) {
//       super(...args);
//       ConstructComponent(this, options);
//     }
//
//     connectedCallback(): void {
//       if (typeof this.onConnected === 'function') {
//         this.onConnected();
//       }
//     }
//
//     disconnectedCallback(): void {
//       if (typeof this.onDisconnected === 'function') {
//         this.onDisconnected.call(this);
//       }
//     }
//
//     attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
//       console.log('change');
//     }
//   })<[]>('Component');
// }

// export function ComponentFactory<TBase extends Constructor<HTMLElement>>(superClass: TBase) {
//   return class Component extends superClass implements IComponent {
//     public readonly data: any;
//     public readonly attributeListener: INotificationsObservable<string, any>;
//
//     constructor(...args: any[]) {
//       super(...args);
//       this.data = {};
//     }
//   };
// }



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

export function Component(options: IComponentOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    const _class = class Component extends target implements IComponent, ConnectedCallBack, DisconnectedCallBack, AttributeChangedCallback {
      public readonly onCreate: (context: IComponentContext) => void;
      public readonly onInit: () => void;
      public readonly onDestroy: () => void;
      public readonly onConnected: () => void;
      public readonly onDisconnected: () => void;

      constructor(...args: any[]) {
        super(...args);
        ConstructComponent(this, options);
      }

      connectedCallback(): void {
        if (typeof this.onConnected === 'function') {
          this.onConnected();
        }
      }

      disconnectedCallback(): void {
        if (typeof this.onDisconnected === 'function') {
          this.onDisconnected.call(this);
        }
      }

      attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        OnComponentAttributeChange(this, name, oldValue, newValue);
      }
    };

    // RegisterCustomElement creates an instance of the component, so we need to disabled the init
    disabledComponentInit.add(_class);
    RegisterCustomElement(_class, options);
    disabledComponentInit.delete(_class);

    return _class;
  };
}


// export function HostBind(attributeName: string, options: ITemplateBuildOptions = {}) {
//   return PropertyOrMethodDecoratorWrapper(<T>(
//     target: Object,
//     propertyKey: string,
//     type: PropertyDescriptorType,
//     descriptor: Readonly<TypedPropertyDescriptor<T>>
//   ) => {
//     options = NormalizeBuildOptions(options);
//
//     const data: any = { source: new Source<T>() };
//     const container = document.createElement('div');
//     container.innerHTML = `<div ${attributeName}="data.source"></div>`;
//     const attributeGenerator: IAttributeGenerator = parseAttribute(container.firstElementChild.attributes[0], options.module);
//     const hostTemplateGenerator: HostTemplateGenerator = new HostTemplateGenerator(attributeGenerator);
//
//     let resolve: any;
//
//     const node: Promise<Node> = templateCodeToTemplateFunction(hostTemplateGenerator.generate(['node'].concat(options.constantsToImport)))((name: string) => { // require function
//       if (name === options.dataSourceName) {
//         return Promise.resolve(data);
//       } else if (name === 'node'){
//         return new Promise<Node>((_resolve: any) =>{
//           resolve = _resolve;
//         });
//       } else {
//         return options.require(name);
//       }
//     });
//
//     const newDescriptor: TypedPropertyDescriptor<T> = {
//       configurable: descriptor.configurable,
//       enumerable: descriptor.enumerable
//     };
//
//     newDescriptor.get = function (): T {
//       resolve(this);
//       Object.defineProperty(data, 'source', {
//         get: data
//       });
//       return descriptor.get.call(this);
//     };
//
//     newDescriptor.set = function (value: T): void {
//       resolve(this);
//       return descriptor.set.call(this, value);
//     };
//
//     return {
//       descriptor: newDescriptor,
//     };
//   });
// }
