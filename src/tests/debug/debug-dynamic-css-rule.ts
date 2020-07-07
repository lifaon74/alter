import {
  DOMChangeObservable,
  IDOMChangeObservable,
  IObservable, IObservableContext, IObserver, IReadonlyList, Observable, Observer, ReadonlyList
} from '@lifaon/observables';
import { isSameSet } from '../../misc/helpers/set-operations';
import { Style } from '../../core/style/implementation';
import { ISetChange } from '../../misc/set-change/interfaces';
import { SetChange } from '../../misc/set-change/implementation';

// TODO function able ton convert a css selector with special rules into a valid css selector

/** EXPERIMENTAL **/

export interface ICSSRuleSelectorTargetObservableValue<TElement extends Element> extends ISetChange<TElement> {
}


export class CSSRuleSelectorTargetObservableValue<TElement extends Element> extends SetChange<TElement> implements ICSSRuleSelectorTargetObservableValue<TElement> {
}

/*---*/

export interface ICSSRuleSelectorTargetObservable<TElement extends Element> extends IObservable<ICSSRuleSelectorTargetObservableValue<TElement>> {
  readonly selector: string;
}

export const STATIC_DOM_CHANGE_OBSERVABLE: IDOMChangeObservable = new DOMChangeObservable(document, {
  childList: true,
  subtree: true,
  attributes: true,
});

const CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST: Set<ICSSRuleSelectorTargetObservable<any>> = new Set<ICSSRuleSelectorTargetObservable<Element>>();
const CSS_RULE_SELECTOR_TARGET_OBSERVABLE_SHARED_OBSERVER: IObserver<void> = new Observer<void>(() => {
  CSSRuleSelectorTargetObservableSharedUpdate();
})
  .observe(STATIC_DOM_CHANGE_OBSERVABLE);

export function CSSRuleSelectorTargetObservableSharedUpdate(): void {
  const list: ICSSRuleSelectorTargetObservable<Element>[] = Array.from(CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST);
  const listLength: number = list.length;

  const observableTargets: Element[][] = list.map(() => []);

  const treeWalker: TreeWalker = document.createTreeWalker(
    document,
    NodeFilter.SHOW_ELEMENT,
  );

  while (treeWalker.nextNode()) {
    const node: Element = treeWalker.currentNode as Element;
    for (let i = 0; i < listLength; i++) {
      const observable: ICSSRuleSelectorTargetObservable<Element> = list[i];
      if (node.matches(observable.selector)) {
        observableTargets[i].push(node);
      }
    }
  }

  for (let i = 0; i < listLength; i++) {
    const observable: ICSSRuleSelectorTargetObservable<Element> = list[i];
    const values: Element[] = observableTargets[i];
    const valuesSet: Set<Element> = new Set<Element>(values);
    const previousValues: Set<Element> = (observable as any)._values;
    if (!isSameSet(previousValues, valuesSet)) {
      const diff: ICSSRuleSelectorTargetObservableValue<Element> = new CSSRuleSelectorTargetObservableValue<Element>(previousValues, values);
      (observable as any)._values = valuesSet;
      (observable as any)._context.emit(diff);
    }
  }
}

export function CSSRuleSelectorTargetObservableSharedAdd<TElement extends Element>(instance: ICSSRuleSelectorTargetObservable<TElement>): void {
  CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST.add(instance);
  if (!CSS_RULE_SELECTOR_TARGET_OBSERVABLE_SHARED_OBSERVER.activated) {
    CSSRuleSelectorTargetObservableSharedUpdate();
    CSS_RULE_SELECTOR_TARGET_OBSERVABLE_SHARED_OBSERVER.activate();
  }
}

export function CSSRuleSelectorTargetObservableSharedRemove<TElement extends Element>(instance: ICSSRuleSelectorTargetObservable<TElement>): void {
  CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST.delete(instance);
  if (CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST.size === 0) {
    // if (CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST.values().next().done) {
    CSS_RULE_SELECTOR_TARGET_OBSERVABLE_SHARED_OBSERVER.deactivate();
  }
}

/*--*/

export function CSSRuleSelectorTargetObservableOnObserved<TElement extends Element>(instance: ICSSRuleSelectorTargetObservable<TElement>): void {
  if (instance.observers.length === 1) { // or !CSS_RULE_SELECTOR_TARGET_OBSERVABLE_LIST.has(instance)
    CSSRuleSelectorTargetObservableSharedAdd(instance);
  }
}

export function CSSRuleSelectorTargetObservableOnUnobserved<TElement extends Element>(instance: ICSSRuleSelectorTargetObservable<TElement>): void {
  if (instance.observers.length === 0) {
    CSSRuleSelectorTargetObservableSharedRemove(instance);
  }
}

/**
 * Detects when the NodeList returned by querySelectorAll changes
 */
export class CSSRuleSelectorTargetObservable<TElement extends Element> extends Observable<ICSSRuleSelectorTargetObservableValue<TElement>> implements ICSSRuleSelectorTargetObservable<TElement> {
  public readonly selector: string;

  protected _context: IObservableContext<ICSSRuleSelectorTargetObservableValue<TElement>>;
  protected _values: Set<TElement>;

  constructor(selector: string) {
    let context: IObservableContext<ICSSRuleSelectorTargetObservableValue<TElement>>;
    super((_context: IObservableContext<ICSSRuleSelectorTargetObservableValue<TElement>>) => {
      context = _context;
      return {
        onObserved: () => {
          CSSRuleSelectorTargetObservableOnObserved(this);
        },
        onUnobserved: () => {
          CSSRuleSelectorTargetObservableOnUnobserved(this);
        }
      };
    });

    this.selector = selector;
    // @ts-ignore
    this._context = context;
    this._values = new Set<TElement>();
  }
}


/*----------------*/

export function debugDynamicCssRule(): void {
  // const css: string = `
  //   div[--element='{"minWidth": 300}'] a {
  //     color: red;
  //   }
  // `;

  /**
   * Problems & limits:
   *  - invalid name or value => not present in the stylesheet
   *  - stylesheet doesnt exposes the selector details nor the declarations
   *
   *  => should support dynamic variables with observables and dynamic rule activation
   */

  // const css: string = `
  //   input[--element], div[--element='[{"minWidth": [2]}]'], a[--element='{"maxWidth": 300}'] {
  //     width: 100px;
  //     height: 100px;
  //     border-color: limegreen;
  //   }
  //
  //   body-1 {
  //     color: '$expression(() => (node.parentElement.innerWidth + \\'px\\'))'; /* invalid */
  //     -prop-width: '$expression(() => (node.parentElement.innerWidth + \\'px\\'))'; /* invalid */
  //   }
  //
  //
  //   body-2 {
  //     --color-red: red; /* valid */
  //     background-color: var(--color-red); /* valid */
  //   }
  //
  //   body {
  //     --color-red: js(123); /* valid */
  //     background-color: var(--color-red); /* valid */
  //   }
  //
  //   @media (min-width: 100px) {
  //     div {
  //       background-color: red;
  //     }
  //   }
  // `;

  const css: string = `
    body, div {
      // --color-red: js(123); /* valid */
      --color-red: 'js(parentElement.innerWidth * 2)'; /* valid => problem: the variable is the same for 'body' and 'div' but its value will be different per element */ 
      background-color: var(--color-red); /* valid */
    }
  `;

  const style = Style.fromString(css);
  style.insert(document.body);

  new CSSRuleSelectorTargetObservable<HTMLElement>('.my-class')
    .pipeTo((value: ICSSRuleSelectorTargetObservableValue<HTMLElement>) => {
      console.log('change', Array.from(value.added), Array.from(value.removed));
    })
    .activate();

  // setInterval(() => {
  //   document.body.classList.toggle('my-class');
  //   document.documentElement.classList.toggle('my-class');
  // }, 1000);


  // document.body.style.setProperty('--color-red', 'blue');
}
