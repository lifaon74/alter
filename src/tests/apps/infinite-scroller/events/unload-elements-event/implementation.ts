import { IUnloadElementsEvent, IUnloadElementsEventInit, TUnloadElementsEventType } from './interfaces';
import { IReadonlyList, ReadonlyList } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';

/** PRIVATES **/

export const UNLOAD_ELEMENTS_EVENT_PRIVATE = Symbol('unload-elements-event-private');


export interface IUnloadElementsEventPrivate {
  elements: IReadonlyList<Element>;
}

export interface IUnloadElementsEventInternal extends IUnloadElementsEvent {
  [UNLOAD_ELEMENTS_EVENT_PRIVATE]: IUnloadElementsEventPrivate;
}

/** CONSTRUCTOR **/

export function ConstructUnloadElementsEvent(instance: IUnloadElementsEvent, init: IUnloadElementsEventInit): void {
  ConstructClassWithPrivateMembers(instance, UNLOAD_ELEMENTS_EVENT_PRIVATE);
  (instance as IUnloadElementsEventInternal)[UNLOAD_ELEMENTS_EVENT_PRIVATE].elements = new ReadonlyList<Element>(
    (init.elements === void 0) ? [] : init.elements
  );
}

/** CLASS **/

export class UnloadElementsEvent extends Event implements IUnloadElementsEvent {
  constructor(type: TUnloadElementsEventType, init: IUnloadElementsEventInit = {}) {
    super(type, init);
    ConstructUnloadElementsEvent(this, init);
  }

  get elements(): IReadonlyList<Element> {
    return ((this as unknown) as IUnloadElementsEventInternal)[UNLOAD_ELEMENTS_EVENT_PRIVATE].elements;
  }
}

