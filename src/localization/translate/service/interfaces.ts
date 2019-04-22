
import { INotificationsObservable, IPromiseCancelToken, PromiseCancelToken } from '@lifaon/observables/public';

// export type TTranslateServiceEvents = 'locale-change' | 'translations-change';

export interface ITranslateServiceKeyValueMap {
  'locale-change': string;
  'translations-change': void;
}

export interface ITranslateService extends INotificationsObservable<ITranslateServiceKeyValueMap> {
  getLocale(): string;
  setLocale(locale: string): void;

  setTranslationsLoader(translationsLoaderCallback: TTranslationsLoaderCallback): void;
  createTranslationsLoader(url: string, set?: boolean): TTranslationsLoaderCallback;

  setTranslations(locale: string, translations: TTranslationsRaw): Promise<TTranslations>;
  getTranslations(locale: string, token?: PromiseCancelToken): Promise<TTranslations>;
  deleteTranslations(locale: string): Promise<void>;

  translate(key: string, params?: ITranslateParams, locale?: string, token?: PromiseCancelToken): Promise<string>;
  translateMany(values: TTranslateMany, locale?: string, token?: PromiseCancelToken): Promise<TTranslations>;
}

export type TTranslationsRaw = { [key: string]: string; } | [string, string][] | Iterable<[string, string]>;

export type TTranslationsLoaderCallback = (locale: string, token?: IPromiseCancelToken) => Promise<TTranslationsRaw>;

export interface ITranslateParams {
  [key: string]: string;
}

export type TTranslateMany = { [key: string]: ITranslateParams; } | (string | [string, ITranslateParams])[] | Iterable<string | [string, ITranslateParams]>;

export type TTranslations = Map<string, string>;


