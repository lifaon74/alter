import { IInfiniteScroller, IInfiniteScrollerEventMap, TInfiniteScrollerDirection } from './interfaces';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { InfiniteScroller } from './implementation';
import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { uuid } from '../../../misc/helpers/uuid';
import { LoadDefaultInfiniteScrollerStyle } from './default-style';
import {
  CancellablePromise, DOMResizeObservable, EventsObservable, IAdvancedAbortSignal,
  ICancellablePromiseOptions, AdvancedAbortController, ICancellablePromise, NormalizeICancellablePromiseOptions,
  ICancellablePromiseNormalizedOptions, TNativePromiseLikeOrValue
} from '@lifaon/observables';
import { TAbortStrategy } from '@lifaon/observables/src/misc/advanced-abort-controller/advanced-abort-signal/types';

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

const blockSymbol = Symbol('block');

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
  element[blockSymbol] = block;
  return element;
}


const LOADING_SCROLLERS = new WeakSet<IInfiniteScroller>();

function CreateInfiniteScrollerOnLoadElementFunction(
  scroller: IInfiniteScroller,
  position: 'before' | 'after',
  callback: (event: ILoadElementsEvent, signal: IAdvancedAbortSignal) => TNativePromiseLikeOrValue<HTMLElement[]>,
) {
  return (event: ILoadElementsEvent): void => {
    if (!LOADING_SCROLLERS.has(scroller)) {
      LOADING_SCROLLERS.add(scroller);

      // const controller = new AdvancedAbortController();
      // const signal = controller.signal;

      // const clearListener = new EventsObservable<IInfiniteScrollerEventMap>(scroller)
      //   .addListener('clear', () => {
      //     controller.abort('cleared');
      //   }).activate();

      const endLoading = () => {
        LOADING_SCROLLERS.delete(scroller);
      };

      CancellablePromise.try<HTMLElement[]>((signal: IAdvancedAbortSignal) => callback(event, signal))
        .then((elements: HTMLElement[], signal: IAdvancedAbortSignal) => {
          return (position === 'after')
            ? scroller.appendAfter(elements, { signal })
              .cancelled(endLoading)
            : scroller.appendBefore(elements, { signal })
              .cancelled(endLoading);
        })
        .finally(endLoading);
    }
  };
}

function HandleInfiniteScrollerOnLoadElement(scroller: IInfiniteScroller, callback: (event: ILoadElementsEvent, signal: IAdvancedAbortSignal) => TNativePromiseLikeOrValue<HTMLElement[]>) {
  return new EventsObservable<IInfiniteScrollerEventMap>(scroller)
    .on('load-before', CreateInfiniteScrollerOnLoadElementFunction(scroller, 'before', callback))
    .on('load-after', CreateInfiniteScrollerOnLoadElementFunction(scroller, 'after', callback));
}

function debugAnimationFrame() {
  (window as any).inAnimationFrame = 0;
  const requestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return requestAnimationFrame(function (...args) {
      (window as any).inAnimationFrame++;
      callback(...args);
      // (window as any).inAnimationFrame--;
    });
  };
}


function AsyncIteratorForEachToCancellablePromise<T>(
  iterator: AsyncIterator<T>,
  callback: (value: T, signal: IAdvancedAbortSignal) => TNativePromiseLikeOrValue<void>,
  options?: ICancellablePromiseOptions
): ICancellablePromise<void> {
  // const _options = NormalizeICancellablePromiseOptions<TStrategy>(options);
  const next = (options?: ICancellablePromiseOptions): ICancellablePromise<void> => {
    return CancellablePromise.of<IteratorResult<T>>(iterator.next(), options)
      .then((result: IteratorResult<T>, signal: IAdvancedAbortSignal): (ICancellablePromise<void> | void) => {
        if (!result.done) {
          return CancellablePromise.try<void>((signal: IAdvancedAbortSignal) => callback(result.value, signal), {  signal  })
            .then((result: void, signal: IAdvancedAbortSignal) => {
              return next({ signal });
            });
        }
      });
  };
  return next(options);
}


export function debugBlockBasedInfiniteScroller() {
  debugAnimationFrame();

  const scroller = createInfiniteScroller();
  scroller.style.width = '100%';
  scroller.style.height = '100%';
  scroller.style.border = '0';
  scroller.contentLimitStrategy = 'pause';

  // const indexAttribute: string = 'attr-' + uuid();


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

  function getNumberOfBlocksPerRow(): number {
    return Math.max(1, Math.floor(scroller.offsetWidth / 110));
  }

  function rearrangeChunks(firstVisibleElement: HTMLElement | null = scroller.getFirstVisibleElement()) {
    const numberOfBlocksPerRow: number = getNumberOfBlocksPerRow();
    const chunkSize: number = numberOfBlocksPerRow * 2;
    const chunks: HTMLElement[][] = [];
    let firstVisibleElementInitialPosition: number | undefined;

    if (firstVisibleElement !== null) {
      firstVisibleElementInitialPosition = firstVisibleElement.getBoundingClientRect().top;
      const elementsBeforeFirstVisibleElement: HTMLElement[] = Array.from(scroller.elements({
        after: firstVisibleElement,
        includeAfter: false,
        reversed: true
      }));
      for (let i = 0, l = Math.floor(elementsBeforeFirstVisibleElement.length / chunkSize); i < l; i++) {
        chunks.unshift(elementsBeforeFirstVisibleElement.slice(i * chunkSize, (i + 1) * chunkSize).reverse());
      }
    }

    const elementsAfterFirstVisibleElement: HTMLElement[] = Array.from(scroller.elements({
      after: firstVisibleElement,
      includeAfter: true
    }));
    for (let i = 0, l = Math.ceil(elementsAfterFirstVisibleElement.length / chunkSize); i < l; i++) {
      chunks.push(elementsAfterFirstVisibleElement.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    scroller.replaceElements(chunks);

    if (firstVisibleElement !== null) {
      const firstElementPosition: number = firstVisibleElement.getBoundingClientRect().top - (firstVisibleElementInitialPosition as number);
      scroller.applyTranslation(firstElementPosition, true);
    }
  }

  const blocksIterator: AsyncIterableIterator<IBlock> = blockGenerator();
  const loadedBlocks: IBlock[] = [];

  // const loadedBlocks: IBlock[] = Array.from({ length: 1000 }, (v: any, i: number) => createBlock(i));

  function loadBlocks(startIndex: number, endIndex: number, options?: ICancellablePromiseOptions): ICancellablePromise<IBlock[]> {
    startIndex = Math.max(0, startIndex);
    endIndex = Math.max(startIndex, endIndex);

    let iterableSteps: number = endIndex - loadedBlocks.length;

    async function * generator() {
      let result: IteratorResult<IBlock>;
      while ((iterableSteps-- > 0) && !(result = await blocksIterator.next()).done) {
        yield result.value;
      }
    }

    return AsyncIteratorForEachToCancellablePromise<IBlock>(generator(), (block: IBlock) => {
      loadedBlocks.push(block);
    }, options)
      .then(() => {
        return loadedBlocks.slice(startIndex, endIndex);
      });
  }

  const scrollerObservable = HandleInfiniteScrollerOnLoadElement(scroller, async (event: ILoadElementsEvent, signal: IAdvancedAbortSignal) => {
    // TODO
    // throw 'TODO';
    const loadSize: number = getNumberOfBlocksPerRow() * 2;
    const refBlockIndex: number = getRefBlockIndex(event.referenceElement);

    let blocks: IBlock[] = [];
    let promise: ICancellablePromise<any>;

    switch (event.type) {
      case 'load-before':
        promise = loadBlocks(
          refBlockIndex - loadSize,
          refBlockIndex,
          { signal }
        )
          .then((block: IBlock[], signal: IAdvancedAbortSignal) => {
            if ((blocks.length !== 0) && (blocks.length < loadSize)) {
              return scroller.appendBefore(blocks.map(CreateBlockElement), { signal });
              // if (signal.aborted) return [];
              // rearrangeChunks();
              // blocks = [];
            } else {
              return block;
            }
          });
        if ((blocks.length !== 0) && (blocks.length < loadSize)) {
          await scroller.appendBefore(blocks.map(CreateBlockElement)).toPromise();
          if (signal.aborted) return [];
          rearrangeChunks();
          blocks = [];
        }
        break;
      case 'load-after': {
        blocks = await loadBlocks(
          refBlockIndex + 1,
          refBlockIndex + 1 + loadSize,
        ).toPromise();
        if (signal.aborted) return [];
        break;
      }
      default:
        throw new Error(`Unexpected event.type`);
    }

    return blocks.map(CreateBlockElement);
  });

  const onResize = () => {
    rearrangeChunks();

    // const firstVisibleElement: HTMLElement | null = scroller.getFirstVisibleElement();
    // const elements: HTMLElement[] = Array.from(scroller.elements({ after: firstVisibleElement, includeAfter: true }));
    // const numberOfBlocksPerRow: number = getNumberOfBlocksPerRow();
    // const numberOfBlocks: number = elements.length;
    //
    // if (numberOfBlocks >= numberOfBlocksPerRow) {
    //   const chunkSize: number = numberOfBlocksPerRow;
    //   const chunks: HTMLElement[][] = [];
    //
    //   for (let i = 0, l = elements.length; i < l; i++) {
    //     elements
    //   }
    //   scroller.replaceElements(elements.slice(0, Math.floor(numberOfBlocks / numberOfBlocksPerRow) * numberOfBlocksPerRow));
    //
    // } else {
    //   const firstElement: HTMLElement | null = (firstVisibleElement === null)
    //     ? null
    //     : scroller.elements({ after: firstVisibleElement, reversed: true }).next().value || null;
    //
    //   // console.log((firstElement === null) ? null : firstElement.innerText);
    //
    //   scroller.replaceElements([]);
    //
    //   scroller.dispatchEvent(new LoadElementsEvent('load-after', {
    //     referenceElement: (firstElement === null) ? null : firstElement,
    //     distance: 0
    //   }));
    // }
  };

  const scrollerResizeObserver = new DOMResizeObservable(scroller, { maxRefreshPeriod: 0 })
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
