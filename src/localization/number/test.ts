import { mapPipe, TimerObservable } from '@lifaon/observables/public';
import { $source } from '@lifaon/observables/operators/misc';
import { currency, numberFormatService } from './implementation';
import { NumberFormatOptions } from './interfaces';
import { $number } from './pipes';


export async function testNumberFormatPipe() {
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

