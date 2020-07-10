import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable, IAdvancedAbortSignal, TObservableOrValue } from '@lifaon/observables';
import { ITranslateParams } from './interfaces';
import { LocalizationServiceLocaleObservable } from '../functions';
import { LoadService } from '../../../core/services/services-loader';
import { TranslateService } from './implementation';
import { TranslateServiceTranslationsChangeObservable } from './functions';

/**
 * Creates a new AsyncFunctionObservable based on the following input arguments,
 * emitting translated strings
 */
export function $translate(
  key: TObservableOrValue<string>,
  params: TObservableOrValue<ITranslateParams>,
  locale: TObservableOrValue<string> = LocalizationServiceLocaleObservable(LoadService(TranslateService))
): IAsyncFunctionObservable<typeof translate> {
  return new AsyncFunctionObservable(
    translate, [
      $observable(key),
      $observable(params),
      $observable(locale as TObservableOrValue<string | undefined>),
      TranslateServiceTranslationsChangeObservable(LoadService(TranslateService)),
    ]);
}

function translate(
  signal: IAdvancedAbortSignal,
  key: string, params: any,
  locale: string | undefined,
  translationsChangeId: string,
): Promise<string> {
  return LoadService(TranslateService).translate(key, params, locale, signal);
}

