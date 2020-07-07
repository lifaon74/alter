import { NumberFormatOptions } from './interfaces';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable, TObservableOrValue, IAdvancedAbortSignal } from '@lifaon/observables';
import { LocalizationServiceLocaleObservable } from '../functions';
import { LoadService } from '../../../core/services/services-loader';
import { NumberFormatService } from './implementation';

/**
 * Creates a new AsyncFunctionObservable based on the following input arguments,
 * emitting formatted numbers
 */
export function $number(
  value: TObservableOrValue<number>,
  options?: TObservableOrValue<NumberFormatOptions>,
  locale: TObservableOrValue<string> = LocalizationServiceLocaleObservable(LoadService(NumberFormatService))
): IAsyncFunctionObservable<typeof formatNumber> {
  return new AsyncFunctionObservable(formatNumber, [$observable(value), $observable(options as TObservableOrValue<NumberFormatOptions | undefined>), $observable(locale as TObservableOrValue<string | undefined>)]);
}

function formatNumber(
  signal: IAdvancedAbortSignal,
  value: number,
  options: NumberFormatOptions | undefined,
  locale: string | undefined
): Promise<string> {
  return LoadService(NumberFormatService).format(value, options, locale);
}

