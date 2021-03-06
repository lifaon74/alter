import { $observable, TObservableOrValue } from '@lifaon/observables/src/operators/misc';
import { IAsyncFunctionObservable } from '@lifaon/observables/src/observables/distinct/async-function-observable/interfaces';
import { AsyncFunctionObservable } from '@lifaon/observables/src/observables/distinct/async-function-observable/implementation';
import { ICancelToken, KeyValueMapToNotifications } from '@lifaon/observables';
import { dateFormatService } from './implementation';
import { DateTimeFormatOptions, IDateFormatServiceKeyValueMap } from './interfaces';

export function $date(date: TObservableOrValue<number | Date>, options?: TObservableOrValue<DateTimeFormatOptions>, locale?: TObservableOrValue<string>): IAsyncFunctionObservable<typeof formatDate> {
  return new AsyncFunctionObservable(formatDate, [$observable(date), $observable(options), $observable(locale), dateFormatService]);
}

function formatDate(token: ICancelToken, date: number | Date, options: DateTimeFormatOptions | undefined, locale: string | undefined, notification: KeyValueMapToNotifications<IDateFormatServiceKeyValueMap>): Promise<string> {
  return dateFormatService.format(date, options, locale);
}
