import { IReadonlyList } from '@lifaon/observables';

export type TUnloadElementsEventType = 'unload-before' | 'unload-after' | 'clear';

export interface IUnloadElementsEventInit extends EventInit {
  elements?: Iterable<Element>;
}

export interface IUnloadElementsEvent extends Event {
  readonly elements?: IReadonlyList<Element>;
}

