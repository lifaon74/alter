import { ILoadElementsEvent, ILoadElementsEventInit, TLoadElementsEventType } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const LOAD_ELEMENTS_EVENT_PRIVATE = Symbol('load-elements-event-private');


export interface ILoadElementsEventPrivate {
  elementReference: Element | null;
  distance: number;
}

export interface ILoadElementsEventInternal extends ILoadElementsEvent {
  [LOAD_ELEMENTS_EVENT_PRIVATE]: ILoadElementsEventPrivate;
}

export function ConstructLoadElementsEvent(event: ILoadElementsEvent, init: ILoadElementsEventInit): void {
  ConstructClassWithPrivateMembers(event, LOAD_ELEMENTS_EVENT_PRIVATE);

  if ((init.elementReference === void 0) || (init.elementReference === null)) {
    (event as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].elementReference = null;
  } else if (init.elementReference instanceof Element) {
    (event as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].elementReference = init.elementReference;
  } else {
    throw new TypeError(`Expected Element as init.elementReference`);
  }

  if (init.distance === void 0) {
    (event as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].distance = null;
  } else {
    const distance: number = Number(init.distance);
    if (Number.isNaN(distance)) {
      throw new TypeError(`Expected number as init.distance`);
    } else if (distance < 0) {
      throw new TypeError(`Expected number greater than 0 as init.distance`);
    } else {
      (event as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].distance = distance;
    }
  }

}


export class LoadElementsEvent extends Event implements ILoadElementsEvent {
  constructor(type: TLoadElementsEventType, init: ILoadElementsEventInit = {}) {
    super(type, init);
    ConstructLoadElementsEvent(this, init);
  }

  get elementReference(): Element | null {
    return ((this as unknown) as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].elementReference;
  }

  get distance(): number {
    return ((this as unknown) as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].distance;
  }
}

