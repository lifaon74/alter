import { DateTimeFormatOptions, IDateFormatService, IDateFormatServiceKeyValueMap } from './interfaces';
import { TempMap } from '../../classes/TempMap';
import { LocalizationService } from '../implementation';


const cachedDateTimeFormat: TempMap<string, Intl.DateTimeFormat> = new TempMap<string, Intl.DateTimeFormat>();
export function DateFormatServiceFormat(
  service: IDateFormatService,
  date: number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = service.getLocale()
): Promise<string> {
  const key: string = locale + '-' + JSON.stringify(options);
  if (!cachedDateTimeFormat.has(key, false)) {
    cachedDateTimeFormat.set(key, new Intl.DateTimeFormat(locale, options));
  }

  return Promise.resolve(cachedDateTimeFormat.get(key).format(date));
}


export class DateFormatService extends LocalizationService<IDateFormatServiceKeyValueMap> implements IDateFormatService {
  constructor() {
    super();
  }

  format(date: number | Date, options?: Intl.DateTimeFormatOptions, locale?: string): Promise<string> {
    return DateFormatServiceFormat(this, date, options, locale);
  }
}



export type TDatePredefinedFormat = 'minimal' | 'short' | 'medium' | 'long' | 'full'
  | 'minimalDate' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate'
  | 'shortTime' | 'mediumTime' | 'longTime';
// https://angular.io/api/common/DatePipe

// 'short': equivalent to 'M/d/yy, h:mm a' (6/15/15, 9:03 AM).
// 'medium': equivalent to 'MMM d, y, h:mm:ss a' (Jun 15, 2015, 9:03:01 AM).
// 'long': equivalent to 'MMMM d, y, h:mm:ss a z' (June 15, 2015 at 9:03:01 AM GMT+1).
// 'full': equivalent to 'EEEE, MMMM d, y, h:mm:ss a zzzz' (Monday, June 15, 2015 at 9:03:01 AM GMT+01:00).
// 'shortDate': equivalent to 'M/d/yy' (6/15/15).
// 'mediumDate': equivalent to 'MMM d, y' (Jun 15, 2015).
// 'longDate': equivalent to 'MMMM d, y' (June 15, 2015).
// 'fullDate': equivalent to 'EEEE, MMMM d, y' (Monday, June 15, 2015).
// 'shortTime': equivalent to 'h:mm a' (9:03 AM).
// 'mediumTime': equivalent to 'h:mm:ss a' (9:03:01 AM).
// 'longTime': equivalent to 'h:mm:ss a z' (9:03:01 AM GMT+1).
// 'fullTime': equivalent to 'h:mm:ss a zzzz' (9:03:01 AM GMT+01:00).

export function datePredefined(
  format: TDatePredefinedFormat,
  options: DateTimeFormatOptions = {}
): DateTimeFormatOptions {
  return Object.assign(DateFormatToDateTimeFormatOptions(format), options);
}

export function DateFormatToDateTimeFormatOptions(format: TDatePredefinedFormat): DateTimeFormatOptions {
  switch (format) {
    case 'minimal':
      return {
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
      };
    case 'short':
      return {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
      };
    case 'medium':
      return {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      };
    case 'long':
      return {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZoneName: 'short'
      };
    case 'full':
      return {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZoneName: 'short'
      };

    case 'minimalDate':
      return {
        year: '2-digit', month: 'numeric', day: 'numeric',
      };
    case 'shortDate':
      return {
        year: 'numeric', month: 'numeric', day: 'numeric',
      };
    case 'mediumDate':
      return {
        year: 'numeric', month: 'short', day: 'numeric',
      };
    case 'longDate':
      return {
        year: 'numeric', month: 'long', day: 'numeric',
      };
    case 'fullDate':
      return {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      };

    case 'shortTime':
      return {
        hour: 'numeric', minute: 'numeric'
      };
    case 'mediumTime':
      return {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      };
    case 'longTime':
      return {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZoneName: 'short'
      };
    default:
      throw new TypeError(`Unknown date format: ${format}`);
  }
}
export const dateFormatService: IDateFormatService = new DateFormatService();


