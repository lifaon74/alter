import { dateFormatService, datePredefined } from './implementation';
import { IObservable, mapPipe, TimerObservable } from '@lifaon/observables/public';
import { $source } from '@lifaon/observables/operators/misc';
import { DateTimeFormatOptions } from './interfaces';
import { $date } from './pipes';

export async function testDateFormatPipe() {

  dateFormatService.setLocale('fr');

  const date = new TimerObservable(1000)
    .pipeThrough(mapPipe<void, number>(() => Date.now()));

  // const options = $source<DateTimeFormatOptions>({
  //   year: 'numeric', month: 'numeric', day: 'numeric',
  //   hour: 'numeric', minute: 'numeric', second: 'numeric',
  // });

  // const options = $source<DateTimeFormatOptions>(datePredefined('short'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('medium'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('long'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('full'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('shortDate'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('mediumDate'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('longDate'));
  const options = $source<DateTimeFormatOptions>(datePredefined('fullDate'));

  $date(date as any, options)
    .pipeTo((text: string) => {
      console.log(text);
    }).activate();

  (window as any).date = date;
  (window as any).options = options;
  (window as any).dateFormatService = dateFormatService;
}

