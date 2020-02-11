/** TYPES **/

export type TLoadElementsEventType = 'load-before' | 'load-after';

/** INTERFACES **/

export interface ILoadElementsEventInit extends EventInit {
  referenceElement?: Element | null;
  distance?: number;
}

export interface ILoadElementsEvent extends Event {
  readonly referenceElement: Element | null;
  readonly distance: number;
}

