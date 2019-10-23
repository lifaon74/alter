import { IObserver } from '@lifaon/observables';
import { TExtractStylesFromAny } from '../helpers';

export interface IDynamicStyleListConstructor {
  new(element: HTMLElement): IDynamicStyleList;
}

export type TDynamicStyleListValue = TExtractStylesFromAny;

export interface IDynamicStyleList extends IObserver<TDynamicStyleListValue> {
  readonly element: HTMLElement;
}
