import { IEventListenerGenerator, IEventListenerGeneratorOptions } from './interfaces';
import { AttributeGenerator } from '../implementation';


/**
 * Generator for a event listener attribute:
 * Syntax:
 *  - standard: (event)
 *  - prefixed: on-event
 */
export class EventListenerGenerator extends AttributeGenerator implements IEventListenerGenerator {
  constructor(options: IEventListenerGeneratorOptions) {
    super(options);
  }

  get observerValue(): string {
    return this.modifiers.has('expression')
      ? `new NotificationsObserver('${this.name}', (event) => { ${this.value} }).activate()`
      : `$observer(${this.value})`;
  }

  generate(): string[] {
    return [
      `// event listener '${this.name}'`,
      `new DynamicEventListener(node, ${JSON.stringify(this.name)}).observedBy(${this.observerValue});`,
    ];
  }
}

