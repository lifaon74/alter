import {
  GetElementAttribute, SetElementAttribute, TElementAttributeType
} from '../../../custom-node/helpers/NodeHelpers';
import { Constructor } from '../../../../classes/factory';
import { GetCustomElementObservedAttributes } from '../functions';
import { CamelCaseToDashCase, IsCamelCase } from '../../../../misc/helpers/case-converter/camel-case';


export interface IAttributeOptions {
  type: TElementAttributeType;
  defaultValue?: boolean | number | string;
  observe?: boolean; // if true, sets this property as an observed attribute
}

/**
 * DECORATOR (PROPERTY)
 *  - reflects the HTMLElement's attribute on this property, and vice-versa => if one changes the other is modified
 *  TODO handle getter/setters
 */
export function Attribute(options: IAttributeOptions): PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
  ): void | PropertyDescriptor => {

    if (typeof propertyKey !== 'string') {
      throw new SyntaxError(`Expected string property`);
    } else if (!IsCamelCase(propertyKey)) {
      throw new SyntaxError(`Expected camel case property`);
    }

    const dashCasePropertyKey: string = CamelCaseToDashCase(propertyKey);

    const newDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: (descriptor === void 0)
        ? true
        : descriptor.enumerable
    };

    newDescriptor.get = function (this: HTMLElement): any {
      return GetElementAttribute(this, dashCasePropertyKey, options.type, options.defaultValue);
    };

    newDescriptor.set = function (this: HTMLElement, value: any): void {
      SetElementAttribute(this, dashCasePropertyKey, value, options.type);
    };

    if (descriptor !== void 0) {
      if (typeof descriptor.get === 'function') {
        throw new TypeError(`@Attribute: the property '${ String(propertyKey) }' should not have a getter.`);
      }
      if (typeof descriptor.set === 'function') {
        const set = newDescriptor.set;
        newDescriptor.set = function (this: HTMLElement, value: any): void {
          SetElementAttribute(this, dashCasePropertyKey, value, options.type);
          set.call(this, value);
        }
      }
    }


    if (options.observe !== false) {
      const observedAttributes: Set<string> = GetCustomElementObservedAttributes(target.constructor as Constructor<HTMLElement>);
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
