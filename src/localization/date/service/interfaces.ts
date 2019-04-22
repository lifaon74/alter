import { INotificationsObservable } from '@lifaon/observables/public';

export type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

// export type TDateServiceEvents = 'locale-change';

export interface IDateServiceKeyValueMap {
  'locale-change': void;
}

export interface IDateService extends INotificationsObservable<IDateServiceKeyValueMap> {
  getLocale(): string;
  setLocale(locale: string): void;

  format(date: number | Date, options?: DateTimeFormatOptions, locale?: string): Promise<string>;
}
