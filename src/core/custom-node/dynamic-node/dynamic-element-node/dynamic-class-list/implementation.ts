import { Observer } from '@lifaon/observables';
import { IDynamicClassList, IDynamicClassListConstructor, TDynamicClassListValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ExtractClassNamesFromAny } from '../helpers';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_CLASS_LIST_PRIVATE = Symbol('dynamic-class-list-private');

export interface IDynamicClassListPrivate {
  element: Element;
  previousClassNames: Set<string>;
}

export interface IDynamicClassListPrivatesInternal extends IObserverPrivatesInternal<TDynamicClassListValue> {
  [DYNAMIC_CLASS_LIST_PRIVATE]: IDynamicClassListPrivate;
}

export interface IDynamicClassListInternal extends IDynamicClassListPrivatesInternal, IDynamicClassList {
}


/** CONSTRUCTOR **/

export function ConstructDynamicClassList(instance: IDynamicClassList, element: Element): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_CLASS_LIST_PRIVATE);
  BindObserverWithNodeStateObservable(instance, element);
  const privates: IDynamicClassListPrivate = (instance as IDynamicClassListInternal)[DYNAMIC_CLASS_LIST_PRIVATE];
  privates.element = element;
  privates.previousClassNames = new Set<string>();
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicClassListOnEmit(instance: IDynamicClassList, value: TDynamicClassListValue): void {
  const privates: IDynamicClassListPrivate = (instance as IDynamicClassListInternal)[DYNAMIC_CLASS_LIST_PRIVATE];
  const classNames: Set<string> = ExtractClassNamesFromAny(value);
  const nextClassNames: string[] = DiffPreviousClassNames(privates.previousClassNames, classNames);

  // console.log(previousClassNames, nextClassNames);

  const iterator: IterableIterator<string> = privates.previousClassNames.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    privates.element.classList.remove(result.value);
  }

  for (let i = 0, l = nextClassNames.length; i < l; i++) {
    privates.element.classList.add(nextClassNames[i]);
  }

  privates.previousClassNames = classNames;
}

/** FUNCTIONS **/

/**
 * Removes from 'previousClassNames' values in 'classNames' (keep only class names to remove)
 * Appends in 'nextClassNames' the list of new class names (class names to add)
 * @param previousClassNames
 * @param classNames - list of classNames to set
 * @return nextClassNames
 */
export function DiffPreviousClassNames(previousClassNames: Set<string>, classNames: Set<string>): string[] {
  const nextClassNames: string[] = [];
  const iterator: Iterator<string> = classNames.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    if (previousClassNames.has(result.value)) {
      previousClassNames.delete(result.value);
    } else {
      nextClassNames.push(result.value);
    }
  }

  return nextClassNames;
}


/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicClassListGetElement(instance: IDynamicClassList): Element {
  return (instance as IDynamicClassListInternal)[DYNAMIC_CLASS_LIST_PRIVATE].element;
}


/** CLASS **/

export const DynamicClassList: IDynamicClassListConstructor = class DynamicClassList extends Observer<TDynamicClassListValue> implements IDynamicClassList {
  constructor(element: Element) {
    super((value: TDynamicClassListValue) => {
      DynamicClassListOnEmit(this, value);
    });
    ConstructDynamicClassList(this, element);
  }

  get element(): Element {
    return DynamicClassListGetElement(this);
  }
};
