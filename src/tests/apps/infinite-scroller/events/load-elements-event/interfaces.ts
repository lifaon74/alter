/** TYPES **/

export type TLoadElementsEventType = 'load-before' | 'load-after';

/** INTERFACES **/

export interface ILoadElementsEventInit extends EventInit {
  elementReference?: Element | null;
  distance?: number;
}

export interface ILoadElementsEvent extends Event {
  readonly elementReference: Element | null;
  readonly distance: number;
}

