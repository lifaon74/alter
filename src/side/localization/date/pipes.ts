import { dateFormatService } from './implementation';
import { DateTimeFormatOptions } from './interfaces';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable, TObservableOrValue, IAdvancedAbortSignal } from '@lifaon/observables';
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
