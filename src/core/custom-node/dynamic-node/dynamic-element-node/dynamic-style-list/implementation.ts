import { IDynamicStyleList, IDynamicStyleListConstructor, TDynamicStyleListValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ExtractStylesFromAny } from '../helpers';
import { Observer } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserverPrivatesInternal } from '@lifaon/observables/types/core/observer/privates';

/** PRIVATES **/

export const DYNAMIC_STYLE_LIST_PRIVATE = Symbol('dynamic-style-list-private');

export interface IDynamicStyleListPrivate {
  element: HTMLElement;
  previousStyles: Map<string, string>;
}

export interface IDynamicStyleListPrivatesInternal extends IObserverPrivatesInternal<TDynamicStyleListValue> {
  [DYNAMIC_STYLE_LIST_PRIVATE]: IDynamicStyleListPrivate;
}

export interface IDynamicStyleListInternal extends IDynamicStyleListPrivatesInternal, IDynamicStyleList {
}


/** CONSTRUCTOR **/

export function ConstructDynamicStyleList(instance: IDynamicStyleList, element: HTMLElement): void {
  ConstructClassWithPrivateMembers(instance, DYNAMIC_STYLE_LIST_PRIVATE);
  BindObserverWithNodeStateObservable(instance, element);
  const privates: IDynamicStyleListPrivate = (instance as IDynamicStyleListInternal)[DYNAMIC_STYLE_LIST_PRIVATE];
  privates.element = element;
  privates.previousStyles = new Map<string, string>();
}

/** CONSTRUCTOR FUNCTIONS **/

export function DynamicStyleListOnEmit(instance: IDynamicStyleList, value: TDynamicStyleListValue): void {
  const privates: IDynamicStyleListPrivate = (instance as IDynamicStyleListInternal)[DYNAMIC_STYLE_LIST_PRIVATE];

  const styles: Map<string, string> = ExtractStylesFromAny(value);
  const nextStyles: [string, string][] = DiffPreviousStyles(privates.previousStyles, styles);

  // console.log(previousStyles, nextStyles);

  const iterator: IterableIterator<string> = privates.previousStyles.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    privates.element.style.removeProperty(result.value);
  }

  for (let i = 0, l = nextStyles.length; i < l; i++) {
    const style: [string, string] = nextStyles[i];
    privates.element.style.setProperty(style[0], style[1]);
  }

  privates.previousStyles = styles;
}

/** FUNCTIONS **/

/**
 * Removes from 'previousStyles' values in 'styles' (keep only styles to remove)
 * Appends in 'nextStyles' the list of new styles (styles to add / update)
 * @param previousStyles
 * @param styles - list of styles to set / update
 * @return nextStyles
 */
export function DiffPreviousStyles(previousStyles: Map<string, string>, styles: Map<string, string>): [string, string][] {
  const nextStyles: [string, string][] = [];
  const iterator: IterableIterator<[string, string]> = styles.entries();
  let result: IteratorResult<[string, string]>;
  while (!(result = iterator.next()).done) {
    const [key, value] = result.value;
    if (previousStyles.has(key)) {
      if (previousStyles.get(key) !== value) {
        nextStyles.push([key, value]);
      }
      previousStyles.delete(key);
    } else {
      nextStyles.push([key, value]);
    }
  }

  return nextStyles;
}

/** METHODS **/

/* GETTERS/SETTERS */

export function DynamicStyleListGetElement(instance: IDynamicStyleList): HTMLElement {
  return (instance as IDynamicStyleListInternal)[DYNAMIC_STYLE_LIST_PRIVATE].element;
}


/** CLASS **/


export const DynamicStyleList: IDynamicStyleListConstructor = class DynamicStyleList extends Observer<TDynamicStyleListValue> implements IDynamicStyleList {
  constructor(element: HTMLElement) {
    super((value: TDynamicStyleListValue) => {
      DynamicStyleListOnEmit(this, value);
    });
    ConstructDynamicStyleList(this, element);
  }

  get element(): HTMLElement {
    return DynamicStyleListGetElement(this);
  }
};
