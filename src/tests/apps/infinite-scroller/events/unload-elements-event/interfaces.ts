import { IReadonlyList } from '@lifaon/observables';

/** TYPES **/

export type TUnloadElementsEventType = 'unload-before' | 'unload-after' | 'clear';

/** INTERFACES **/

export interface IUnloadElementsEventInit extends EventInit {
  elements?: Iterable<Element>;
}

export interface IUnloadElementsEvent extends Event {
  readonly elements?: IReadonlyList<Element>;
}

