import { INotificationsObservable, KeyValueMapConstraint } from '@lifaon/observables/public';

export interface ILocalizationServiceKeyValueMap {
  'locale-change': void;
}

export type LocalizationServiceKeyValueMapConstraint<TKVMap extends object> = KeyValueMapConstraint<TKVMap, ILocalizationServiceKeyValueMap>;


export interface ILocalizationService<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> extends INotificationsObservable<TKVMap> {
  getLocale(): string;
  setLocale(locale: string): void;
}
