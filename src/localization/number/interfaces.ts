import { ILocalizationService, ILocalizationServiceKeyValueMap } from '../interfaces';

export type NumberFormatOptions = Intl.NumberFormatOptions;


export interface INumberFormatServiceKeyValueMap extends ILocalizationServiceKeyValueMap {
}

export interface INumberFormatService extends ILocalizationService<INumberFormatServiceKeyValueMap> {
  format(value: number, options?: NumberFormatOptions, locale?: string): Promise<string>;
}
