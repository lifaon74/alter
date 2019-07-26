import { $observable, TObservableOrValue } from '@lifaon/observables/operators/misc';
import { IAsyncFunctionObservable } from '@lifaon/observables/observables/distinct/async-function-observable/interfaces';
import { AsyncFunctionObservable } from '@lifaon/observables/observables/distinct/async-function-observable/implementation';
import { ICancelToken, KeyValueMapToNotifications } from '@lifaon/observables/public';
import { numberFormatService } from './implementation';
import { NumberFormatOptions, INumberFormatServiceKeyValueMap } from './interfaces';

export function $number(value: TObservableOrValue<number>, options?: TObservableOrValue<NumberFormatOptions>, locale?: TObservableOrValue<string>): IAsyncFunctionObservable<typeof formatNumber> {
  return new AsyncFunctionObservable(formatNumber, [$observable(value), $observable(options), $observable(locale), numberFormatService]);
}

function formatNumber(token: ICancelToken, value: number, options: NumberFormatOptions | undefined, locale: string | undefined, notification: KeyValueMapToNotifications<INumberFormatServiceKeyValueMap>): Promise<string> {
  return numberFormatService.format(value, options, locale);
}

