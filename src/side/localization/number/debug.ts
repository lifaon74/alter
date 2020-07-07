import { $source, mapPipe, TimerObservable } from '@lifaon/observables';
import { NumberFormatOptions } from './interfaces';
import { $number } from './pipes';
import { currency } from './functions';
import { LoadService } from '../../../core/services/services-loader';
import { NumberFormatService } from './implementation';


export async function debugNumberFormatPipe() {
  const numberFormatService = LoadService(NumberFormatService);
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

