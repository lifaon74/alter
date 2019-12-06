import { numberFormatService } from './implementation';
import { NumberFormatOptions } from './interfaces';
import { TObservableOrValue } from '@lifaon/observables/types/operators/shortcuts/types';
import { $observable, AsyncFunctionObservable, IAsyncFunctionObservable } from '@lifaon/observables';
import { IAdvancedAbortSignal } from '@lifaon/observables/types/misc/advanced-abort-controller/advanced-abort-signal/interfaces';
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

