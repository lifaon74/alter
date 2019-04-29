import { ITemplate } from '../../../template/interfaces';
import { NodeStateObservableOf } from '../../../custom-node/node-state-observable/implementation';
import { IStyle } from '../../../style/interfaces';
import { GetNodeDOMState } from '../../../custom-node/node-state-observable/mutations';
import {
  INotificationsObservable, INotificationsObservableContext, NotificationsObservable
} from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { Constructor } from '../../../classes/factory';
import {
  IComponent, IComponentContext, IComponentContextAttributeListenerKeyValueMap, IComponentOptions
} from './interfaces';
import { IHostBinding } from '../host-binding/interfaces';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from './decorator';


export const COMPONENT_PRIVATE = Symbol('component-private');

export interface IComponentPrivate<T extends object> {
  context: IComponentContext<T>;
}

export interface IComponentInternal<T extends object> extends IComponent<T> {
  [COMPONENT_PRIVATE]: IComponentPrivate<T>;
}


export const disabledComponentInit: WeakSet<Constructor<IComponent<any>>> = new WeakSet<Constructor<IComponent<any>>>();
export function ConstructComponent<T extends object>(component: IComponent<T>, options: IComponentOptions): void {
  ConstructClassWithPrivateMembers(component, COMPONENT_PRIVATE);
  (component as IComponentInternal<T>)[COMPONENT_PRIVATE].context = new ComponentContext();

  if (!disabledComponentInit.has(component.constructor as any)) {
    InitComponent<T>(component, options);
  }
}

export function InitComponent<T extends object>(component: IComponent<T>, options: IComponentOptions): void {
  if (typeof component.onCreate === 'function') {
    component.onCreate.call(component, (component as IComponentInternal<T>)[COMPONENT_PRIVATE].context);
  }

  const constructorPrivates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(component.constructor as Constructor<IComponent<T>>);

  Promise.all([
    Promise.all(
      constructorPrivates.hostBindings.map((hostBinding: IHostBinding) => hostBinding.resolve(component))
    ),
    LoadComponentTemplate<T>(component, options.template),
    LoadComponentStyle<T>(component, options.style),
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

export function LoadComponentTemplate<T extends object>(component: IComponent<T>, template?: Promise<ITemplate> | ITemplate): Promise<void> {
  if (template) {
    return Promise.resolve(template)
      .then((template: ITemplate) => {
        return template.insert((component as IComponentInternal<T>)[COMPONENT_PRIVATE].context.data, component, 'clear');
      });
  } else {
    return Promise.resolve();
  }
}

export function LoadComponentStyle<T extends object>(component: IComponent<T>, style?: Promise<IStyle> | IStyle): Promise<any> {
  if (style) {
    return Promise.resolve(style)
      .then((style: IStyle) => {
        return style.insert(component);
      });
  } else {
    return Promise.resolve();
  }
}

export function OnComponentAttributeChange<T extends object>(component: IComponent<T>, name: string, oldValue: string, newValue: string): void {
  const context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap> = ((component as IComponentInternal<T>)[COMPONENT_PRIVATE].context as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].context;
  context.dispatch(name, { previous: oldValue, current: newValue }); // TODO improve
}

/*------------------------------*/


export const COMPONENT_CONTEXT_PRIVATE = Symbol('component-context-private');

export interface IComponentContextPrivate<T extends object> {
  data: T;
  attributeListener: INotificationsObservable<IComponentContextAttributeListenerKeyValueMap>;
  context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>;
}

export interface IComponentContextInternal<T extends object> extends IComponentContext<T> {
  [COMPONENT_CONTEXT_PRIVATE]: IComponentContextPrivate<T>;
}

export function ConstructComponentContext<T extends object>(context: IComponentContext<T>): void {
  ConstructClassWithPrivateMembers(context, COMPONENT_PRIVATE);
  (context as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].data = {} as T;
  (context as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].attributeListener = new NotificationsObservable((_context: INotificationsObservableContext<IComponentContextAttributeListenerKeyValueMap>) => {
    (context as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].context = _context;
  });
}

export class ComponentContext<T extends object> implements IComponentContext<T> {

  constructor() {
    ConstructComponentContext(this);
  }

  get data(): T {
    return ((this as unknown) as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].data;
  }

  get attributeListener(): INotificationsObservable<IComponentContextAttributeListenerKeyValueMap> {
    return ((this as unknown) as IComponentContextInternal<T>)[COMPONENT_CONTEXT_PRIVATE].attributeListener;
  }
}


