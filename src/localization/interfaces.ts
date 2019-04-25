import { INotificationsObservable } from '@lifaon/observables/public';

export interface ILocalizationServiceKeyValueMap {
  'locale-change': void;
}

export interface ILocalizationService<TKVMap extends ILocalizationServiceKeyValueMap> extends INotificationsObservable<TKVMap> {
  getLocale(): string;
  setLocale(locale: string): void;
}
