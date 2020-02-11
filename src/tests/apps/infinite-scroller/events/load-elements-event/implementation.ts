import { ILoadElementsEvent, ILoadElementsEventInit, TLoadElementsEventType } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';

/** PRIVATES **/

export const LOAD_ELEMENTS_EVENT_PRIVATE = Symbol('load-elements-event-private');

export interface ILoadElementsEventPrivate {
  referenceElement: Element | null;
  distance: number;
}

export interface ILoadElementsEventInternal extends ILoadElementsEvent {
  [LOAD_ELEMENTS_EVENT_PRIVATE]: ILoadElementsEventPrivate;
}

/** CONSTRUCTOR **/

export function ConstructLoadElementsEvent(instance: ILoadElementsEvent, init: ILoadElementsEventInit): void {
  ConstructClassWithPrivateMembers(instance, LOAD_ELEMENTS_EVENT_PRIVATE);
  const privates: ILoadElementsEventPrivate = (instance as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE];

  if ((init.referenceElement === void 0) || (init.referenceElement === null)) {
    privates.referenceElement = null;
  } else if (init.referenceElement instanceof Element) {
    privates.referenceElement = init.referenceElement;
  } else {
    throw new TypeError(`Expected Element as init.referenceElement`);
  }

  if (init.distance === void 0) {
    privates.distance = 0;
  } else {
    const distance: number = Number(init.distance);
    if (Number.isNaN(distance)) {
      throw new TypeError(`Expected number as init.distance`);
    } else if (distance < 0) {
      throw new TypeError(`Expected number greater than 0 as init.distance`);
    } else {
      privates.distance = distance;
    }
  }

}

/** CLASS **/

export class LoadElementsEvent extends Event implements ILoadElementsEvent {
  constructor(type: TLoadElementsEventType, init: ILoadElementsEventInit = {}) {
    super(type, init);
    ConstructLoadElementsEvent(this, init);
  }

  get referenceElement(): Element | null {
    return ((this as unknown) as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].referenceElement;
  }

  get distance(): number {
    return ((this as unknown) as ILoadElementsEventInternal)[LOAD_ELEMENTS_EVENT_PRIVATE].distance;
  }
}

