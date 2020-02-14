import { IInfiniteScroller, IInfiniteScrollerEventMap, TInfiniteScrollerDirection } from './interfaces';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { InfiniteScroller } from './implementation';
import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { uuid } from '../../../misc/helpers/uuid';
import { LoadDefaultInfiniteScrollerStyle } from './default-style';
import { EventsObservable, PromiseTry, TPromiseOrValue } from '@lifaon/observables';
import { DOMResizeObservable } from './dom-resize/public';
import { LoadElementsEvent } from './events/load-elements-event/implementation';

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

function createInfiniteScroller(): IInfiniteScroller {
  const scroller = new InfiniteScroller();
  LoadDefaultInfiniteScrollerStyle();

  scroller.style.height = '700px';
  scroller.style.width = '700px';
  scroller.style.border = '1px solid black';

  scroller.direction = 'vertical';

  // scroller.loadDistance = 0;
  // scroller.unloadDistance = 100;

  AttachNode(scroller, document.body);

  (window as any).scroller = scroller;

  return scroller;
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


/*----------------------------------------------------------------------------------------*/

interface IBlock {
  name: string;
  color: string;
}

function CreateBlockElement(block: IBlock): HTMLElement {
  const element = document.createElement('div');
  element.style.display = 'inline-block';
  element.style.height = '100px';
  element.style.width = '100px';
  element.style.backgroundColor = block.color;
  element.style.color = 'white';
  element.style.fontSize = '18px';
  element.style.margin = '5px';
  element.style.padding = '5px';
  element.appendChild(new Text(block.name));
  return element;
}


const LOADING_SCROLLERS = new WeakSet<IInfiniteScroller>();

function CreateInfiniteScrollerOnLoadElementFunction(scroller: IInfiniteScroller, position: 'before' | 'after', callback: (event: ILoadElementsEvent) => TPromiseOrValue<HTMLElement[]>) {
  return (event: ILoadElementsEvent): void => {
    if (!LOADING_SCROLLERS.has(scroller)) {
      LOADING_SCROLLERS.add(scroller);
      PromiseTry<HTMLElement[]>(() => callback(event))
        .then((elements: HTMLElement[]) => {
          return (position === 'after')
            ? scroller.appendAfter(elements)
            : scroller.appendBefore(elements);
        })
        .then(() => {
          LOADING_SCROLLERS.delete(scroller);
        });
    }
  };
}

function HandleInfiniteScrollerOnLoadElement(scroller: IInfiniteScroller, callback: (event: ILoadElementsEvent) => TPromiseOrValue<HTMLElement[]>) {
  return new EventsObservable<IInfiniteScrollerEventMap>(scroller)
    .on('load-before', CreateInfiniteScrollerOnLoadElementFunction(scroller, 'before', callback))
    .on('load-after', CreateInfiniteScrollerOnLoadElementFunction(scroller, 'after', callback))
    .on('clear', () => {
      LOADING_SCROLLERS.delete(scroller);
    });
}

function debugAnimationFrame() {
  (window as any).inAnimationFrame = 0;
  const requestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    return requestAnimationFrame(function(...args) {
      (window as any).inAnimationFrame++;
      callback(...args);
      // (window as any).inAnimationFrame--;
    });
  };
}

export function debugBlockBasedInfiniteScroller() {
  debugAnimationFrame();

  const scroller = createInfiniteScroller();
  scroller.style.width = '100%';
  scroller.style.height = '100%';
  scroller.style.border = '0';
  scroller.contentLimitStrategy = 'pause';

  // const indexAttribute: string = 'attr-' + uuid();

  const blockSymbol = Symbol('block');


  function createBlock(index: number): IBlock {
    return {
      name: `#${ index }`,
      color: `hsl(${ Math.floor(Math.random() * 360) }, 100%, 25%)`,
    };
  }

  async function * blockGenerator(): AsyncGenerator<IBlock> {
    for (let i = 0; i < 1000; i++) {
      yield createBlock(i);
    }
  }

  function getRefBlockIndex(element: Element | null): number {
    return (element === null) ? -1 : loadedBlocks.indexOf(element[blockSymbol]);
  }

  // function loadBlock(startIndex: number, endIndex: number) {
  //
  // }

  const blocksIterator: AsyncIterableIterator<IBlock> = blockGenerator();
  // const loadedBlocks: IBlock[] = [];
  const loadedBlocks: IBlock[] = Array.from({ length: 1000 }, (v: any, i: number) => createBlock(i));

  const scrollerObservable = HandleInfiniteScrollerOnLoadElement(scroller, (event: ILoadElementsEvent) => {
    const loadSize: number = Math.max(1, Math.floor(scroller.offsetWidth / 110) * 10);
    const refBlockIndex: number = getRefBlockIndex(event.referenceElement);

    let startIndex: number;
    let endIndex: number;

    switch (event.type) {
      case 'load-before':
        endIndex = Math.max(0, refBlockIndex);
        startIndex = Math.max(0, endIndex - loadSize);
        console.log(startIndex, endIndex);
        break;
      case 'load-after': {

        startIndex = refBlockIndex + 1;
        endIndex = startIndex + loadSize;

        let iterableSteps: number = endIndex - loadedBlocks.length;

        let result: IteratorResult<IBlock>;
        // while ((iterableSteps-- > 0) && !(result = await blocksIterator.next()).done) {
        //   loadedBlocks.push(result.value);
        // }

        break;
      }
      default:
        throw new Error(`Unexpected event.type`);
    }

    // console.log(loadedBlocks.slice(startIndex, endIndex));

    return loadedBlocks.slice(startIndex, endIndex).map((block: IBlock) => {
      const element: HTMLElement = CreateBlockElement(block);
      element[blockSymbol] = block;
      return element;
    });
  });

  const onResize = () => {
    scroller.replaceElements(Array.from(scroller.elements({ after: scroller.getFirstVisibleElement(), includeAfter: true })));

    // // console.log('resize');
    // // const firstElement: HTMLElement | null = scroller.firstElement;
    // const firstVisibleElement: HTMLElement | null = scroller.getFirstVisibleElement();
    // const firstElement: HTMLElement | null = (firstVisibleElement === null)
    //   ? null
    //   : scroller.elements({ after: firstVisibleElement, reversed: true }).next().value || null;
    //
    // console.log(firstVisibleElement);
    // console.log(firstElement);
    //
    // // const refBlockIndex: number = getRefBlockIndex(scroller.firstElement);
    // // TODO move the dispatchEvent into the clear section
    // scroller.dispatchEvent(new LoadElementsEvent('load-after', {
    //   referenceElement: (firstElement === null) ? null : firstElement,
    //   distance: 0
    // }));
  };

  const scrollerResizeObserver = new DOMResizeObservable(scroller)
    .pipeTo(onResize).activate();

  (window as any).onResize = onResize;

  // (window as any).test = () =>{
  //   const elt = scroller.getFirstVisibleElement();
  //   debugger;
  //   console.log(Array.from(scroller.elements({ after: elt, reversed: true })));
  // };
}

/*----------------------------------------------------------------------------------------*/

export function debugInfiniteScroller() {
  // debugInfiniteScrollerGeneric();
  // debugInfiniteScrollerFromList();
  debugBlockBasedInfiniteScroller();

}
