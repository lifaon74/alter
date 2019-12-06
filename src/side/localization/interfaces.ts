import { INotificationsObservable, KeyValueMapConstraint } from '@lifaon/observables';

/** INTERFACES **/

export interface ILocalizationServiceKeyValueMap {
  'locale-change': string;
}

export type LocalizationServiceKeyValueMapConstraint<TKVMap extends object> = KeyValueMapConstraint<TKVMap, ILocalizationServiceKeyValueMap>;


export interface ILocalizationService<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> extends INotificationsObservable<TKVMap> {
  getLocale(): string;
  setLocale(locale: string): void;
}
