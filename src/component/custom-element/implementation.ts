import { GetElementAttribute, HTMLElementConstructor, SetElementAttribute, TElementAttributeType } from '../../custom-node/helpers/NodeHelpers';
import { htmlElementConstructors, htmlElementConstructorsToTagNamesMap, RegisterHTMLElement } from '../elements-list';
import { Constructor } from '../../classes/interfaces';


/**
 * Returns the main HTMLElement constructor of a class (ex: HTMLInputElement)
 * @param target
 */
export function GetCustomElementHTMLElementConstructor<TFunction extends HTMLElementConstructor>(target: TFunction): TFunction | null {
  let superClass: any = target;
  const objectPrototype: any = Object.getPrototypeOf(Object);
  do {
    superClass = Object.getPrototypeOf(superClass);
    if (superClass === objectPrototype) {
      return null;
    } else if ((superClass === HTMLElement) || htmlElementConstructors.has(superClass)) {
      return superClass;
    }
  } while (true);
}

export function GetCustomElementObservedAttributes(target: HTMLElementConstructor): Set<string> {
  const observedAttributes: Set<string> = new Set<string>();
  let superClass: any = target;
  const objectPrototype: any = Object.getPrototypeOf(Object);

  while (superClass !== objectPrototype) {
    const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(superClass, 'observedAttributes');
    if (descriptor !== void 0) {
      let values: string[];
      if (descriptor.hasOwnProperty('value')) {
        values = descriptor.value;
      } else if (descriptor.hasOwnProperty('get')) {
        values = descriptor.get.call(target);
      } else {
        throw new TypeError(`Expected 'value' or 'get' in descriptor for ${superClass.name}.observedAttributes`);
      }

      for (let i = 0, l = values.length; i < l; i++) {
        observedAttributes.add(values[i]);
      }
    }
    superClass = Object.getPrototypeOf(superClass);
  }

  return observedAttributes;
}

export interface ICustomElementOptions {
  name: string;
  extends?: string | null;
  observedAttributes?: Iterable<string>;
}

export function RegisterCustomElement<TFunction extends HTMLElementConstructor>(target: TFunction, options: ICustomElementOptions): void {
  if (options.observedAttributes !== void 0) {
    const observedAttributes: Set<string> = GetCustomElementObservedAttributes(target);

    for (const attributeName of options.observedAttributes) {
      observedAttributes.add(attributeName);
    }

    Object.defineProperty(target, 'observedAttributes', {
      value: Array.from(observedAttributes),
      writable: false,
      configurable: true,
      enumerable: true,
    });
  }


  let _extends: string | null = null;

  // ensure target is an HTMLElement
  const elementConstructor: TFunction | null = GetCustomElementHTMLElementConstructor<TFunction>(target);
  if (elementConstructor === null) {
    throw new TypeError(`The class '${target.name}' must extend an HTMLElement.`);
  } else if (elementConstructor !== HTMLElement) {
    const tagNames: Set<string> = htmlElementConstructorsToTagNamesMap.get(elementConstructor);

    if (options.extends === void 0) {
      if (tagNames.size === 0) {
        throw new Error(`No tag (options.extends) found for the element '${elementConstructor.name}'`);
      } else if (tagNames.size > 1) {
        throw new Error(`More than one tag (options.extends) found for the element '${elementConstructor.name}'`);
      } else {
        _extends = tagNames.values().next().value;
      }
    } else if (!tagNames.has(options.extends)) {
      throw new Error(`Tag '${options.extends}' is no part of '${elementConstructor.name}'`);
    }
  }

  window.customElements.define(options.name, target, (_extends === null) ? void 0 : { extends: _extends });

  RegisterHTMLElement(options.name, target);
}

/**
 * DECORATOR
 * @param {ICustomElementOptions} options
 */
export function CustomElement(options: ICustomElementOptions) {
  return <TFunction extends Constructor<HTMLElement>>(target: TFunction): TFunction | void => {
    RegisterCustomElement<TFunction>(target, options);
    return target;
  };
}


/*--------------------------------------*/

export interface AttributeOptions {
  type: TElementAttributeType;
  defaultValue?: boolean | number | string;
  observe?: boolean;
}

/**
 * DECORATOR
 * @param options
 */
export function Attribute(options: AttributeOptions) {
  return (target: HTMLElement, propertyKey: string): any => {
    const newDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: true
    };

    newDescriptor.get = function (this: HTMLElement): any {
      return GetElementAttribute(this, propertyKey, options.type, options.defaultValue);
    };

    newDescriptor.set = function (this: HTMLElement, value: any): void {
      SetElementAttribute(this, propertyKey, value, options.type);
    };


    if (options.observe !== false) {
      const observedAttributes: Set<string> = GetCustomElementObservedAttributes(target.constructor as HTMLElementConstructor);
      observedAttributes.add(propertyKey);

      Object.defineProperty(target.constructor, 'observedAttributes', {
        value: Array.from(observedAttributes),
        writable: false,
        configurable: true,
        enumerable: true,
      });
    }

    return newDescriptor;
  };
}

