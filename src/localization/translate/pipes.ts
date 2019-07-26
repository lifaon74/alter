import { $observable, TObservableOrValue } from '@lifaon/observables/operators/misc';
import { IAsyncFunctionObservable } from '@lifaon/observables/observables/distinct/async-function-observable/interfaces';
import { AsyncFunctionObservable } from '@lifaon/observables/observables/distinct/async-function-observable/implementation';
import { translateService } from './implementation';
import { ICancelToken, KeyValueMapToNotifications } from '@lifaon/observables/public';
import { ITranslateParams, ITranslateServiceKeyValueMap } from './interfaces';

export function $translate(key: TObservableOrValue<string>, params: TObservableOrValue<ITranslateParams>, locale?: TObservableOrValue<string>): IAsyncFunctionObservable<typeof translate> {
  return new AsyncFunctionObservable(translate, [$observable(key), $observable(params), $observable(locale), translateService]);
}

function translate(token: ICancelToken, key: string, params: any, locale: string | undefined, notification: KeyValueMapToNotifications<ITranslateServiceKeyValueMap>): Promise<string> {
  return translateService.translate(key, params, locale, token);
}

