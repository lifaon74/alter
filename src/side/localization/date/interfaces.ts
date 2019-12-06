import { ILocalizationService, ILocalizationServiceKeyValueMap } from '../interfaces';

/** INTERFACES **/

export type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export interface IDateFormatServiceKeyValueMap extends ILocalizationServiceKeyValueMap {
}

export interface IDateFormatService extends ILocalizationService<IDateFormatServiceKeyValueMap> {
  format(date: number | Date, options?: DateTimeFormatOptions, locale?: string): Promise<string>;
}
