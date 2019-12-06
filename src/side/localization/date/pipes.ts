import { dateFormatService } from './implementation';
import { DateTimeFormatOptions } from './interfaces';
import { TObservableOrValue } from '@lifaon/observables/types/operators/shortcuts/types';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable } from '@lifaon/observables';
import { IAdvancedAbortSignal } from '@lifaon/observables/types/misc/advanced-abort-controller/advanced-abort-signal/interfaces';
import { LocalizationServiceLocaleObservable } from '../functions';

/**
 * Creates a new AsyncFunctionObservable based on the following input arguments,
 * emitting formatted dates
 */
export function $date(
  date: TObservableOrValue<number | Date>,
  options?: TObservableOrValue<DateTimeFormatOptions>,
  locale: TObservableOrValue<string> = LocalizationServiceLocaleObservable(dateFormatService)
): IAsyncFunctionObservable<typeof formatDate> {
  return new AsyncFunctionObservable(formatDate, [$observable(date), $observable(options as TObservableOrValue<DateTimeFormatOptions | undefined>), $observable(locale as TObservableOrValue<string | undefined>)]);
}

function formatDate(
  signal: IAdvancedAbortSignal,
  date: number | Date,
  options: DateTimeFormatOptions | undefined,
  locale: string | undefined,
): Promise<string> {
  return dateFormatService.format(date, options, locale);
}
