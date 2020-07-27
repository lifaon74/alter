import { IObservable } from '@lifaon/observables';

/** TYPES **/

export type TTouchFrameObservableMatrix = DOMMatrix;

/** INTERFACES **/

export interface ITouchFrameObservableConstructor {
  new<GTarget extends EventTarget = EventTarget>(target: GTarget): ITouchFrameObservable<GTarget>;
}

export interface ITouchFrameObservable<GTarget extends EventTarget = EventTarget> extends IObservable<TTouchFrameObservableMatrix> {
  readonly target: GTarget;
  readonly matrix: TTouchFrameObservableMatrix;

  reset(): void;
}
