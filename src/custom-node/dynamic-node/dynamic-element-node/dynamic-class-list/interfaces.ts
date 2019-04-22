import { IObserver } from '@lifaon/observables/public';
import { TExtractClassNamesFromAny } from '../helpers';

export interface IDynamicClassListConstructor {
  new(element: Element): IDynamicClassList;
}

export type TDynamicClassListValue = TExtractClassNamesFromAny;

export interface IDynamicClassList extends IObserver<TDynamicClassListValue> {
  readonly element: Element;
}
