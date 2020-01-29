import { numberFormatService } from './implementation';
import { NumberFormatOptions } from './interfaces';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable, TObservableOrValue, IAdvancedAbortSignal } from '@lifaon/observables';
import { LocalizationServiceLocaleObservable } from '../functions';

/**
 * Creates a new AsyncFunctionObservable based on the following input arguments,
 * emitting formatted numbers
 */
export function $number(
  value: TObservableOrValue<number>,
  options?: TObservableOrValue<NumberFormatOptions>,
  locale: TObservableOrValue<string> = LocalizationServiceLocaleObservable(numberFormatService)
): IAsyncFunctionObservable<typeof formatNumber> {
  return new AsyncFunctionObservable(formatNumber, [$observable(value), $observable(options as TObservableOrValue<NumberFormatOptions | undefined>), $observable(locale as TObservableOrValue<string | undefined>)]);
}

function formatNumber(
  signal: IAdvancedAbortSignal,
  value: number,
  options: NumberFormatOptions | undefined,
  locale: string | undefined
): Promise<string> {
  return numberFormatService.format(value, options, locale);
}

