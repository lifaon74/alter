import { IsObject, noop } from '../../../helpers';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  IHostBinding, IHostBindingOptions, THostBindingOnResolve, THostBindingOnResolveResultValue
} from './interfaces';
import { AccessComponentConstructorPrivates, IComponentConstructorPrivate } from '../component/implementation';
import { Constructor } from '../../../classes/factory';
import { parseAttribute } from '../../../template/generators/element-node-generator/attribute/parser';
import { ITemplateBuildOptions, TTemplateRawFunction } from '../../../template/interfaces';
import {
  NormalizeTemplateBuildOptions, TemplateCodeToTemplateDebuggableFunction
} from '../../../template/implementation';
import { TemplateGenerator } from '../../../template/generators/template-generator/implementation';
import { Expression, IsObservable, IsObserver, ISource, Observer, Source } from '@lifaon/observables/public';
import { GetCustomElementHTMLElementConstructor } from '../custom-element/implementation';



export const HOST_BINDING_PRIVATE = Symbol('host-binding-private');

export interface IHostBindingPrivate {
  attributeName: string;
  onResolve: THostBindingOnResolve;
  options: IHostBindingOptions;
  templateFunction: TTemplateRawFunction;
}

export interface IHostBindingInternal extends IHostBinding {
  [HOST_BINDING_PRIVATE]: IHostBindingPrivate;
}

export function NormalizeHostBindingOptions(options: IHostBindingOptions): IHostBindingOptions {
  return NormalizeTemplateBuildOptions(options);
}

export function ConstructHostBinding(instance: IHostBinding, attributeName: string, onResolve: THostBindingOnResolve, options: IHostBindingOptions = {}): void {
  ConstructClassWithPrivateMembers(instance, HOST_BINDING_PRIVATE);
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  privates.attributeName = attributeName;
  privates.onResolve = onResolve;
  privates.options = NormalizeHostBindingOptions(options);

  const container: HTMLDivElement = document.createElement('div');
  container.innerHTML = `<div ${ attributeName }="data.value"></div>`;

  privates.templateFunction = TemplateCodeToTemplateDebuggableFunction(
    new TemplateGenerator([parseAttribute(container.firstElementChild.attributes[0], privates.options.module)])
      .generate(['node'].concat(privates.options.constantsToImport))
  );

}

export function IsHostBinding(value: any): value is IHostBinding {
  return IsObject(value)
    && value.hasOwnProperty(HOST_BINDING_PRIVATE);
}


export function HostBindingResolve(instance: IHostBinding, node: Element): Promise<void> {
  const privates: IHostBindingPrivate = (instance as IHostBindingInternal)[HOST_BINDING_PRIVATE];
  return privates.templateFunction((name: string) => { // require function
    if (name === privates.options.dataSourceName) {
      return new Promise<any>((resolve: any) => {
        resolve(privates.onResolve(node));
      }).then((value: THostBindingOnResolveResultValue) => {
        return {
          value: value,
        };
      });
    } else if (name === 'node') {
      return Promise.resolve(node);
    } else {
      return privates.options.require(name);
    }
  }).then(noop);
}

export class HostBinding implements IHostBinding {
  constructor(attributeName: string, onResolve: THostBindingOnResolve, options?: ITemplateBuildOptions) {
    ConstructHostBinding(this, attributeName, onResolve, options);
  }

  get attributeName(): string {
    return ((this as unknown) as IHostBindingInternal)[HOST_BINDING_PRIVATE].attributeName;
  }

  resolve(node: Element): Promise<void> {
    return HostBindingResolve(this, node);
  }
}




export function HostBind(attributeName: string, options?: IHostBindingOptions): PropertyDecorator {
  return (target: HTMLElement, propertyKey: string | symbol, descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey)): void | PropertyDescriptor => {

    const elementConstructor: Constructor<HTMLElement> | null = GetCustomElementHTMLElementConstructor<Constructor<HTMLElement>>(target.constructor as Constructor<HTMLElement>);
    if (elementConstructor === null) {
      throw new TypeError(`The class '${target.constructor.name}' must extend an HTMLElement.`);
    }

    const privates: IComponentConstructorPrivate = AccessComponentConstructorPrivates(target.constructor as Constructor<HTMLElement>);

    privates.hostBindings.push(
      new HostBinding(attributeName, (node: Element) => {
        return new Promise<any>((resolve: any) => {
          console.log('resolving', node);
          debugger;
          if (descriptor === void 0) {
            let mode: 'undefined' | 'observable' | 'observer' | 'source' = 'undefined' as any;
            let source: ISource<any>;
            let value: any;
            Object.defineProperty(node, propertyKey, {
              configurable: false,
              enumerable: true,
              get: function() {
                return value;
              },
              set: function(_value: any) {
                console.log('setting!!!');
                switch (mode) {
                  case 'undefined':
                    if (IsObservable(_value)) {
                      mode = 'observable';
                      resolve(_value);
                    } else if (IsObserver(_value) || (typeof _value === 'function')) {
                      mode = 'observer';
                      resolve(_value);
                    } else {
                      mode = 'source';
                      source = new Source<any>().emit(_value);
                      resolve(source);
                    }
                    value = _value;
                    break;
                  case 'observable':
                    throw new TypeError(`The property '${String(propertyKey)}' has been detected as an Observable, thus, its setter can't be updated`);
                  case 'observer':
                    throw new TypeError(`The property '${String(propertyKey)}' has been detected as an Observer, thus, its setter can't be updated`);
                  case 'source':
                    source.emit(value);
                    value = _value;
                    break;
                  default:
                    throw new TypeError(`Unexpected mode ${mode}`);
                }
              }
            });
          } else if ('value' in descriptor) {
            throw new TypeError(`The property '${String(propertyKey)}' has been detected as an Expression, thus, no setter is expected.`);
          } else if (typeof descriptor.get === 'function') { // getter => expression
            if (typeof descriptor.set === 'function') {
              throw new TypeError(`The property '${String(propertyKey)}' has been detected as an Expression, thus, no setter is expected.`);
            } else {
              return resolve(new Expression<any>(() => descriptor.get.call(target)));
            }
          } else if (typeof descriptor.set === 'function') {  // setter only => destination
            return resolve(new Observer<any>((value: any) => descriptor.set.call(value)));
          }
        });
      }, options)
    );

    const newDescriptor:PropertyDescriptor = {
      configurable: false,
      enumerable: (descriptor === void 0) ? true : descriptor.enumerable,
      get() {
        throw new TypeError(`Cannot get the property '${String(propertyKey)}'.`);
      },
      set() {
        throw new TypeError(`Cannot set the property '${String(propertyKey)}'.`);
      }
    };

    if (descriptor === void 0) {
      Object.defineProperty(target, propertyKey, newDescriptor);
    } else {
      return newDescriptor;
    }
  };
}


// export function HostBind(attributeName: string/*, options: IHostBindOptions = {}*/): PropertyDecorator {
//   return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey)): void | PropertyDescriptor => {
//
//     const newDescriptor: PropertyDescriptor = {
//       configurable: descriptor.configurable,
//       enumerable: descriptor.enumerable
//     };
//
//     if (descriptor === void 0) {
//       Object.defineProperty(target, propertyKey, newDescriptor);
//     } else {
//       return newDescriptor;
//     }
//   };
// }
