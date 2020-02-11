import { IInfiniteScroller, IInfiniteScrollerContentLimitStrategy, TInfiniteScrollerDirection } from './interfaces';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { InfiniteScroller } from './implementation';
import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { uuid } from '../../../misc/helpers/uuid';

function CreateHorizontalDummyElement(index: number): HTMLElement {
  const element = document.createElement('div');
  element.id = String(index);
  element.style.height = '50px';
  element.style.backgroundColor = ((index % 2) === 0) ? '#aaa' : '#eee';
  element.appendChild(new Text(`item: ${ index }`));
  return element;
}

function CreateVerticalDummyElement(index: number): HTMLElement {
  const element = document.createElement('div');
  element.id = String(index);
  element.style.width = '100px';
  element.style.backgroundColor = ((index % 2) === 0) ? '#aaa' : '#eee';
  element.appendChild(new Text(`item: ${ index }`));
  return element;
}

function CreateDummyElement(index: number, direction: TInfiniteScrollerDirection): HTMLElement {
  return (direction === 'vertical')
    ? CreateHorizontalDummyElement(index)
    : CreateVerticalDummyElement(index);
}

function AppendInfiniteScrollerElements(scroller: IInfiniteScroller, elements: HTMLElement[], position: 'before' | 'after', timeout: number = 0): Promise<void> {
  const append = (): Promise<void> => {
    return (position === 'after')
      ? scroller.appendAfter(elements)
      : scroller.appendBefore(elements);
  };

  if (timeout <= 0) {
    return append();
  } else {
    return new Promise<void>((resolve: any, reject: any) => {
      setTimeout(() => {
        resolve(append());
      }, timeout);
    });
  }
}


export function InitInfiniteScrollerWithList(
  scroller: IInfiniteScroller,
  elementFactories: (() => HTMLElement)[],
  delay: number = 0
) {
  let loading: boolean = false;
  const indexAttribute: string = 'attr-' + uuid();

  scroller.contentLimitStrategy = 'stop';

  const getReferenceElementIndex = (referenceElement: Element | null) => {
    return (referenceElement === null)
      ? 0
      : parseInt(referenceElement.getAttribute(indexAttribute) as string, 10);
  };

  const createElement = (index: number): HTMLElement => {
    const element: HTMLElement = elementFactories[index]();
    element.setAttribute(indexAttribute, String(index));
    return element;
  };

  scroller.addEventListener('load-after', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      const referenceIndex: number = getReferenceElementIndex(event.referenceElement);
      const elements: HTMLElement[] = elementFactories
        .slice(referenceIndex + 1, referenceIndex + 11)
        .map((factory: any, index: number) => createElement(referenceIndex + 1 + index));

      AppendInfiniteScrollerElements(scroller, elements, 'after', delay)
        .then(() => {
          loading = false;
        });
    }
  });

  scroller.addEventListener('load-before', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      const referenceIndex: number = getReferenceElementIndex(event.referenceElement);
      const elements: HTMLElement[] = elementFactories
        .slice(Math.max(0, referenceIndex - 11), Math.max(0, referenceIndex - 1))
        .map((factory: any, index: number, array) => createElement(referenceIndex - array.length + index));

      AppendInfiniteScrollerElements(scroller, elements, 'before', delay)
        .then(() => {
          loading = false;
        });
    }
  });

}


function createInfiniteScroller(): IInfiniteScroller {
  const scroller = new InfiniteScroller();
  InfiniteScroller.loadDefaultStyle();

  const contentLimitStrategy: IInfiniteScrollerContentLimitStrategy = 'ignore';

  scroller.style.height = '500px';
  scroller.style.width = '500px';
  scroller.style.border = '1px solid black';

  scroller.direction = 'vertical';

  // scroller.contentLimitWheelStrategy = contentLimitStrategy;
  // scroller.contentLimitTouchMoveStrategy = contentLimitStrategy;
  // scroller.contentLimitTouchInertiaStrategy = contentLimitStrategy;
  // scroller.contentLimitMouseMiddleStrategy = contentLimitStrategy;

  // scroller.loadDistance = 0;
  // scroller.unloadDistance = 100;

  AttachNode(scroller, document.body);

  (window as any).scroller = scroller;

  return scroller;
}

export function debugInfiniteScrollerGeneric() {
  const scroller = createInfiniteScroller();
  let loading: boolean = false;

  const delay: number = 100;

  // scroller.setAttribute('load-distance', '100');
  // scroller.setAttribute('load-distance', '1000');
  // console.log(InfiniteScroller.observedAttributes);

  scroller.addEventListener('load-after', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      let id: number = (event.referenceElement === null) ? 0 : parseInt(event.referenceElement.id, 10);

      const elements: HTMLElement[] = Array.from({ length: 10 }, () => CreateDummyElement(++id, scroller.direction));
      AppendInfiniteScrollerElements(scroller, elements, 'after', delay)
        .then(() => {
          loading = false;
        });
    }
  });

  scroller.addEventListener('load-before', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      let id: number = (event.referenceElement === null) ? 0 : parseInt(event.referenceElement.id, 10);

      const elements: HTMLElement[] = Array.from({ length: 10 }, () => CreateDummyElement(--id, scroller.direction)).reverse();
      AppendInfiniteScrollerElements(scroller, elements, 'before', delay)
        .then(() => {
          loading = false;
        });
    }
  });

  // scroller.addEventListener('unload-before', (event: IUnloadElementsEvent) => {
  //   console.log('unload', Array.from(event.elements));
  // });

}

export function debugInfiniteScrollerFromList() {
  const scroller = createInfiniteScroller();

  InitInfiniteScrollerWithList(
    scroller,
    Array.from({ length: 50 }, (value: any, index: number) => {
      return () => CreateDummyElement(index, scroller.direction);
    }),
    0
  );
}

export function debugInfiniteScroller() {
  // debugInfiniteScrollerGeneric();
  debugInfiniteScrollerFromList();

}
