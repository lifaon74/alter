import { TInfiniteScrollerDirection } from './interfaces';
import { AttachNode } from '../../custom-node/node-state-observable/mutations';
import { ILoadElementsEvent } from './events/load-elements-event/interfaces';
import { InfiniteScroller } from './implementation';

function CreateHorizontalDummyElement(index: number): HTMLElement {
  const element = document.createElement('div');
  element.id = String(index);
  element.style.height = '50px';
  element.style.backgroundColor = ((index % 2) === 0) ? '#aaa' : '#eee';
  element.appendChild(new Text(`item: ${index}`));
  return element;
}

function CreateVerticalDummyElement(index: number): HTMLElement {
  const element = document.createElement('div');
  element.id = String(index);
  element.style.width = '100px';
  element.style.backgroundColor = ((index % 2) === 0) ? '#aaa' : '#eee';
  element.appendChild(new Text(`item: ${index}`));
  return element;
}

function CreateDummyElement(index: number, direction: TInfiniteScrollerDirection): HTMLElement {
  return (direction === 'vertical')
    ? CreateHorizontalDummyElement(index)
    : CreateVerticalDummyElement(index);
}


export function testInfiniteScroller() {
  const scroller = new InfiniteScroller();
  InfiniteScroller.loadDefaultStyle();

  scroller.style.height = '500px';
  scroller.style.width = '500px';
  scroller.style.border = '1px solid black';

  scroller.direction = 'vertical';

  // scroller.loadDistance = 0;
  // scroller.unloadDistance = 100;

  AttachNode(scroller, document.body);
  let loading: boolean = false;

  // scroller.setAttribute('load-distance', '100');
  // scroller.setAttribute('load-distance', '1000');
  // console.log(InfiniteScroller.observedAttributes);

  scroller.addEventListener('load-after', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      let id: number = (event.elementReference === null) ? 0 : parseInt(event.elementReference.id, 10);

      const elements: HTMLElement[] = Array.from({ length: 10 }, () => CreateDummyElement(++id, scroller.direction));
      scroller.appendAfter(elements)
        .then(() => {
          loading = false;
        });
      // setTimeout(() => {
      //   scroller.appendAfter(elements)
      //     .then(() => {
      //       loading = false;
      //       // console.log(Array.from(scroller.listChildren()));
      //     });
      // }, 1000);
    }
  });

  scroller.addEventListener('load-before', (event: ILoadElementsEvent) => {
    if (!loading) {
      loading = true;
      let id: number = (event.elementReference === null) ? 0 : parseInt(event.elementReference.id, 10);

      const elements: HTMLElement[] = Array.from({ length: 10 }, () => CreateDummyElement(--id, scroller.direction)).reverse();

      scroller.appendBefore(elements)
        .then(() => {
          loading = false;
        });

      // setTimeout(() => {
      //   scroller.appendBefore(elements)
      //     .then(() => {
      //       loading = false;
      //     });
      // }, 100);
    }
  });

  // scroller.addEventListener('unload-before', (event: IUnloadElementsEvent) => {
  //   console.log('unload', Array.from(event.elements));
  // });

}
