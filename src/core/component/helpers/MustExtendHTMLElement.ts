import { GetCustomElementHTMLElementConstructor } from '../custom-element/functions';
import { Constructor } from '@lifaon/class-factory';

export function MustExtendHTMLElement(target: any): asserts target is HTMLElement {
  const elementConstructor: Constructor<HTMLElement> | null = GetCustomElementHTMLElementConstructor<Constructor<HTMLElement>>(target.constructor as Constructor<HTMLElement>);
  if (elementConstructor === null) {
    throw new TypeError(`The class '${ target.constructor.name }' must extend an HTMLElement.`);
  }
}
