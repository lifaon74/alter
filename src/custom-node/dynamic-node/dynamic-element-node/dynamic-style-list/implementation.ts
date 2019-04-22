import { IDynamicStyleList, IDynamicStyleListConstructor, TDynamicStyleListValue } from './interfaces';
import { BindObserverWithNodeStateObservable } from '../../ObserverNode';
import { ExtractStylesFromAny } from '../helpers';
import { Observer } from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';

export const DYNAMIC_StyleList_PRIVATE = Symbol('dynamic-style-list-private');

export interface IDynamicStyleListPrivate {
  element: HTMLElement;
  previousStyles: Map<string, string>;
}

export interface IDynamicStyleListInternal extends IDynamicStyleList {
  [DYNAMIC_StyleList_PRIVATE]: IDynamicStyleListPrivate;
}


export function ConstructDynamicStyleList(dynamicStyleList: IDynamicStyleList, element: HTMLElement): void {
  ConstructClassWithPrivateMembers(dynamicStyleList, DYNAMIC_StyleList_PRIVATE);
  BindObserverWithNodeStateObservable(dynamicStyleList, element);
  (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].element = element;
  (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].previousStyles = new Map<string, string>();
}

export function DynamicStyleListOnEmit(dynamicStyleList: IDynamicStyleList, value: TDynamicStyleListValue): void {
  const styles: Map<string, string> = ExtractStylesFromAny(value);
  const nextStyles: [string, string][] = DiffPreviousStyles((dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].previousStyles, styles);

  // console.log(previousStyles, nextStyles);

  const iterator: IterableIterator<string> = (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].previousStyles.values();
  let result: IteratorResult<string>;
  while (!(result = iterator.next()).done) {
    (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].element.style.removeProperty(result.value);
  }

  for (let i = 0, l = nextStyles.length; i < l; i++) {
    const style: [string, string] = nextStyles[i];
    (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].element.style.setProperty(style[0], style[1]);
  }

  (dynamicStyleList as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].previousStyles = styles;
}

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


export const DynamicStyleList: IDynamicStyleListConstructor = class DynamicStyleList extends Observer<TDynamicStyleListValue> implements IDynamicStyleList {
  constructor(element: HTMLElement) {
    super((value: TDynamicStyleListValue) => {
      DynamicStyleListOnEmit(this, value);
    });
    ConstructDynamicStyleList(this, element);
  }

  get element(): HTMLElement {
    return ((this as unknown) as IDynamicStyleListInternal)[DYNAMIC_StyleList_PRIVATE].element;
  }
};
