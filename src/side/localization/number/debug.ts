import { $source, mapPipe, TimerObservable } from '@lifaon/observables';
import { numberFormatService } from './implementation';
import { NumberFormatOptions } from './interfaces';
import { $number } from './pipes';
import { currency } from './functions';


export async function debugNumberFormatPipe() {
  numberFormatService.setLocale('fr');

  const value = new TimerObservable(1000)
    .pipeThrough(mapPipe<void, number>(() => Math.random() * 1e5));

  const options = $source<NumberFormatOptions>(currency('EUR'));

  $number(value, options)
    .pipeTo((text: string) => {
      console.log('currency:', text);
    }).activate();

  (window as any).value = value;
  (window as any).options = options;
  (window as any).numberFormatService = numberFormatService;
}

