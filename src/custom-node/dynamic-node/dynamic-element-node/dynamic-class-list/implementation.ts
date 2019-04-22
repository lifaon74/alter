import { Observer } from '@lifaon/observables/public';
import { IDynamicClassList, IDynamicClassListConstructor, TDynamicClassListValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ExtractClassNamesFromAny } from '../helpers';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const DYNAMIC_ClassList_PRIVATE = Symbol('dynamic-class-list-private');

export interface IDynamicClassListPrivate {
  element: Element;
  previousClassNames: Set<string>;
}

export interface IDynamicClassListInternal extends IDynamicClassList {
  [DYNAMIC_ClassList_PRIVATE]: IDynamicClassListPrivate;
}


export function ConstructDynamicClassList(dynamicClassList: IDynamicClassList, element: Element): void {
  ConstructClassWithPrivateMembers(dynamicClassList, DYNAMIC_ClassList_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicClassList, element);
  (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].element = element;
  (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].previousClassNames = new Set<string>();
}

export function DynamicClassListOnEmit(dynamicClassList: IDynamicClassList, value: TDynamicClassListValue): void {
  const classNames: Set<string> = ExtractClassNamesFromAny(value);
  const nextClassNames: string[] = DiffPreviousClassNames((dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].previousClassNames, classNames);

  // console.log(previousClassNames, nextClassNames);

  const iterator: IterableIterator<string> = (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].previousClassNames.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].element.classList.remove(result.value);
  }

  for (let i = 0, l = nextClassNames.length; i < l; i++) {
    (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].element.classList.add(nextClassNames[i]);
  }

  (dynamicClassList as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].previousClassNames = classNames;
}

/**
 * Removes from 'previousClassNames' values in 'classNames' (keep only class names to remove)
 * Appends in 'nextClassNames' the list of new class names (class names to add)
 * @param previousClassNames
 * @param classNames - list of classNames to set
 * @return nextClassNames
 */
export function DiffPreviousClassNames(previousClassNames: Set<string>, classNames: Set<string>): string[] {
  const nextClassNames: string[] = [];
  const iterator: IterableIterator<string> = classNames.values();
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


export const DynamicClassList: IDynamicClassListConstructor = class DynamicClassList extends Observer<TDynamicClassListValue> implements IDynamicClassList {
  constructor(element: Element) {
    super((value: TDynamicClassListValue) => {
      DynamicClassListOnEmit(this, value);
    });
    ConstructDynamicClassList(this, element);
  }

  get element(): Element {
    return ((this as unknown) as IDynamicClassListInternal)[DYNAMIC_ClassList_PRIVATE].element;
  }
};
