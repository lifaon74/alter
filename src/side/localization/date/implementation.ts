import { IDateFormatService, IDateFormatServiceKeyValueMap } from './interfaces';
import { LocalizationService } from '../implementation';
import { TempMap } from '../../../classes/TempMap';
import { DEFAULT_CACHE_TIME } from '../config';


/** METHODS **/

const CACHED_DATE_TIME_FORMAT: TempMap<string, Intl.DateTimeFormat> = new TempMap<string, Intl.DateTimeFormat>(DEFAULT_CACHE_TIME);

export function DateFormatServiceFormat(
  instance: IDateFormatService,
  date: number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = instance.getLocale()
): Promise<string> {
  const key: string = locale + '-' + JSON.stringify(options);
  if (!CACHED_DATE_TIME_FORMAT.has(key, false)) {
    CACHED_DATE_TIME_FORMAT.set(key, new Intl.DateTimeFormat(locale, options));
  }

  return Promise.resolve((CACHED_DATE_TIME_FORMAT.get(key) as Intl.DateTimeFormat).format(date));
}

/** CLASS **/

export class DateFormatService extends LocalizationService<IDateFormatServiceKeyValueMap> implements IDateFormatService {
  constructor() {
    super();
  }

  format(date: number | Date, options?: Intl.DateTimeFormatOptions, locale?: string): Promise<string> {
    return DateFormatServiceFormat(this, date, options, locale);
  }
}


export const dateFormatService: IDateFormatService = new DateFormatService();


