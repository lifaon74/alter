import { INumberFormatService, INumberFormatServiceKeyValueMap, NumberFormatOptions } from './interfaces';
import { TempMap } from '../../classes/TempMap';
import { LocalizationService } from '../implementation';


const cachedNumberTimeFormat: TempMap<string, Intl.NumberFormat> = new TempMap<string, Intl.NumberFormat>();
export function NumberFormatServiceFormat(
  service: INumberFormatService,
  value: number,
  options?: NumberFormatOptions,
  locale: string = service.getLocale()
): Promise<string> {
  const key: string = locale + '-' + JSON.stringify(options);
  if (!cachedNumberTimeFormat.has(key, false)) {
    cachedNumberTimeFormat.set(key, new Intl.NumberFormat(locale, options));
  }

  return Promise.resolve(cachedNumberTimeFormat.get(key).format(value));
}


export class NumberFormatService extends LocalizationService<INumberFormatServiceKeyValueMap> implements INumberFormatService {
  constructor() {
    super();
  }

  format(value: number, options?: NumberFormatOptions, locale?: string): Promise<string> {
    return NumberFormatServiceFormat(this, value, options, locale);
  }
}


export function currency(
  code: NumberFormatOptions['currency'],
  display?: NumberFormatOptions['currencyDisplay'],
  options: NumberFormatOptions = {}
): NumberFormatOptions {
  return Object.assign({
    style: 'currency',
    currency: code,
    currencyDisplay: display,
  }, options);
}

export function percent(
  options: NumberFormatOptions = {}
): NumberFormatOptions {
  return Object.assign({
    style: 'percent',
  }, options);
}

export const numberFormatService: INumberFormatService = new NumberFormatService();


