import { INumberFormatService, INumberFormatServiceKeyValueMap, NumberFormatOptions } from './interfaces';
import { LocalizationService } from '../implementation';
import { TempMap } from '../../../classes/TempMap';
import { DEFAULT_CACHE_TIME } from '../config';


/** METHODS **/

const CACHED_NUMBER_TIME_FORMAT: TempMap<string, Intl.NumberFormat> = new TempMap<string, Intl.NumberFormat>(DEFAULT_CACHE_TIME);

export function NumberFormatServiceFormat(
  instance: INumberFormatService,
  value: number,
  options?: NumberFormatOptions,
  locale: string = instance.getLocale()
): Promise<string> {
  const key: string = locale + '-' + JSON.stringify(options);
  if (!CACHED_NUMBER_TIME_FORMAT.has(key, false)) {
    CACHED_NUMBER_TIME_FORMAT.set(key, new Intl.NumberFormat(locale, options));
  }

  return Promise.resolve((CACHED_NUMBER_TIME_FORMAT.get(key) as Intl.NumberFormat).format(value));
}

/** CLASS **/

export class NumberFormatService extends LocalizationService<INumberFormatServiceKeyValueMap> implements INumberFormatService {
  constructor() {
    super();
  }

  format(value: number, options?: NumberFormatOptions, locale?: string): Promise<string> {
    return NumberFormatServiceFormat(this, value, options, locale);
  }
}


export const numberFormatService: INumberFormatService = new NumberFormatService();


