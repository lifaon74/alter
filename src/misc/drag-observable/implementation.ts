import { EventsObservable, INotificationsObservableContext, NotificationsObservable } from '@lifaon/observables';
import { IDragObject, IDragObservableKeyValueMap, IPoint2D } from './types';
import { IDragObservable } from './interfaces';
import { KeyValueMapKeys } from '@lifaon/observables/src/notifications/core/interfaces';

export class DragObservable<TElement extends Element> extends NotificationsObservable<IDragObservableKeyValueMap> implements IDragObservable<TElement> {
  readonly target: TElement;

  protected _startPosition: IPoint2D;

  constructor(target: TElement) {
    let context: INotificationsObservableContext<IDragObservableKeyValueMap>;

    const buildPoint2D = (x: number, y: number): Readonly<IPoint2D> => {
      return Object.freeze({ x, y });
    };

    const buildDragObject = (x: number, y: number): IDragObject => {
      return Object.freeze({
        start: this._startPosition,
        delta: buildPoint2D(
          x - this._startPosition.x,
          y - this._startPosition.y
        )
      });
    };

    const buildDragObjectFromMouseEvent = (event: MouseEvent): IDragObject => {
      return buildDragObject(event.clientX, event.clientY);
    };

    const dispatchDragEventFromMouseEvent = (name: KeyValueMapKeys<IDragObservableKeyValueMap>, event: MouseEvent) => {
      context.dispatch(name, buildDragObjectFromMouseEvent(event));
    };

    const windowMouseUpObserver = new EventsObservable<WindowEventMap>(window)
      .addListener('mouseup', (event: MouseEvent) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        dispatchDragEventFromMouseEvent('drag-move', event);
        dispatchDragEventFromMouseEvent('drag-end', event);
        windowMouseUpObserver.deactivate();
        windowMouseMoveObserver.deactivate();
      });

    const windowMouseMoveObserver = new EventsObservable<WindowEventMap>(window)
      .addListener('mousemove', (event: MouseEvent) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        dispatchDragEventFromMouseEvent('drag-move', event);
      });

    const elementMouseDownObserver = new EventsObservable<HTMLElementEventMap>(target)
      .addListener('mousedown', (event: MouseEvent) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        this._startPosition = buildPoint2D(event.clientX, event.clientY);
        dispatchDragEventFromMouseEvent('drag-start', event);
        dispatchDragEventFromMouseEvent('drag-move', event);
        windowMouseUpObserver.activate();
        windowMouseMoveObserver.activate();
      });

    super((_context: INotificationsObservableContext<IDragObservableKeyValueMap>) => {
      context = _context;
      return {
        onObserved: () => {
          if (context.observable.observers.length === 1) {
            elementMouseDownObserver.activate();
          }
        },
        onUnobserved: () => {
          if (!context.observable.observed) {
            elementMouseDownObserver.deactivate();
            windowMouseMoveObserver.deactivate();
            windowMouseUpObserver.deactivate();
          }
        },
      };
    });
    this.target = target;
  }
}
