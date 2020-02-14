import { IObservable, IObservableConstructor } from '@lifaon/observables';
import { ResizeObserverObserveOptions } from '../../../../typing/ResizeObserver'; // TODO fix in the future when definition will exists

export interface IDOMResizeObservableOptions extends ResizeObserverObserveOptions {
  maxRefreshPeriod?: number;
}

export interface IDOMResizeObservableConstructor extends IObservableConstructor {
  new(element: Element, options?: IDOMResizeObservableOptions): IDOMResizeObservable;
}

export interface IDOMResizeObservable extends IObservable<void> {

}
