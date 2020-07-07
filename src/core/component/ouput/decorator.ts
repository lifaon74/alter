import { MustExtendHTMLElement } from '../helpers/MustExtendHTMLElement';
import { PascalCaseToDashCase } from '../../../misc/helpers/case-converter/pascal-case';
import { IsObject } from '../../../misc/helpers/is/IsObject';

export type TOutput<T> = (value: T) => boolean;

export interface IOutputDecorationOption extends EventInit {
  bubbles?: boolean; // (default: false)
  cancelable?: boolean; // (default: false)
  composed?: boolean; // (default: false)
  name?: string; // (default: emit([A-Z][a-zA-Z]*) => dash-case)
}


const OUTPUT_PROPERTY_KEY_REGEXP = /^emit([A-Z][a-zA-Z]*)$/;


/**
 * 'set' =>
 *  - if value is an Observable, subscribes to it and emits the values into 'onEmit',
 *  - else (value not an Observable), calls 'onEmit' with the value.
 * 'get' => returns the last emitted value
 */
export function Output<T>(options: IOutputDecorationOption = {}): PropertyDecorator {
  if (IsObject(options)) {
    return (
      target: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<TOutput<T>> | undefined = Object.getOwnPropertyDescriptor(target, propertyKey)
    ): void | TypedPropertyDescriptor<TOutput<T>> => {

      MustExtendHTMLElement(target);

      if (descriptor !== void 0) {
        throw new TypeError(`@Output: the property '${ String(propertyKey) }' should not be a getter, nor setter.`);
      }

      if (typeof propertyKey !== 'string') {
        throw new TypeError(`@Output: the property '${ String(propertyKey) }' must have a string name.`);
      }

      let eventName: string;
      if (options.name === void 0) {
        const match: RegExpExecArray | null = OUTPUT_PROPERTY_KEY_REGEXP.exec(propertyKey);

        if (match === null) {
          throw new TypeError(`@Output: the property '${ String(propertyKey) }' must follow this pattern: /${ OUTPUT_PROPERTY_KEY_REGEXP.source }/`);
        } else {
          eventName = PascalCaseToDashCase(match[1])
        }
      } else {
        eventName = options.name;
      }

      const bubbles: boolean = (options.bubbles === void 0) ? false : options.bubbles;
      const cancelable: boolean = (options.cancelable === void 0) ? false : options.cancelable;
      const composed: boolean =  (options.composed === void 0) ? false : options.composed;

      return {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function (this: EventTarget, value: T): boolean {
          return this.dispatchEvent(new CustomEvent(eventName, {
            detail: value,
            bubbles,
            cancelable,
            composed,
          }));
        },
      };
    };
  } else {
    throw new TypeError(`@Output: expected object or void as options`);
  }
}
