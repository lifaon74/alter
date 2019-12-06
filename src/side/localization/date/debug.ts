import { dateFormatService} from './implementation';
import { $source, IObservable, mapPipe, TimerObservable } from '@lifaon/observables';
import { DateTimeFormatOptions } from './interfaces';
import { $date } from './pipes';
import { datePredefined } from './functions';

export async function debugDateFormatPipe() {

  dateFormatService.setLocale('fr');

  const date = new TimerObservable(1000)
    .pipeThrough(mapPipe<void, number>(() => Date.now()));

  // const options = $source<DateTimeFormatOptions>({
  //   year: 'numeric', month: 'numeric', day: 'numeric',
  //   hour: 'numeric', minute: 'numeric', second: 'numeric',
  // });

  // const options = $source<DateTimeFormatOptions>(datePredefined('short'));
  const options = $source<DateTimeFormatOptions>(datePredefined('medium'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('long'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('full'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('shortDate'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('mediumDate'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('longDate'));
  // const options = $source<DateTimeFormatOptions>(datePredefined('fullDate'));

  $date(date as IObservable<Date | number>, options)
    .pipeTo((text: string) => {
      console.log(text);
    }).activate();

  (window as any).date = date;
  (window as any).options = options;
  (window as any).dateFormatService = dateFormatService;
}

