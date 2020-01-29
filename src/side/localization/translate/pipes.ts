import { translateService } from './implementation';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable, IAdvancedAbortSignal, TObservableOrValue } from '@lifaon/observables';
import { ITranslateParams } from './interfaces';
import { LocalizationServiceLocaleObservable } from '../functions';

/**
 * Creates a new AsyncFunctionObservable based on the following input arguments,
 * emitting translated strings
 */
export function $translate(
  key: TObservableOrValue<string>,
  params: TObservableOrValue<ITranslateParams>,
  locale: TObservableOrValue<string> = LocalizationServiceLocaleObservable(translateService)
): IAsyncFunctionObservable<typeof translate> {
  return new AsyncFunctionObservable(translate, [$observable(key), $observable(params), $observable(locale as TObservableOrValue<string | undefined>)]);
}

function translate(
  signal: IAdvancedAbortSignal,
  key: string, params: any,
  locale: string | undefined,
): Promise<string> {
  return translateService.translate(key, params, locale, signal);
}

