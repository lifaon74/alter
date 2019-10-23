
import {
  ICancellablePromise, ICancelToken, CancelToken
} from '@lifaon/observables';
import { ILocalizationService, ILocalizationServiceKeyValueMap } from '../interfaces';

/** TYPES **/

export type TTranslationsRaw = { [key: string]: string; } | [string, string][] | Iterable<[string, string]>;

export type TTranslationsLoaderCallback = (locale: string, token?: ICancelToken) => Promise<TTranslationsRaw>;
export type TCreateTranslationsLoaderCallback = (locale: string, token?: ICancelToken) => ICancellablePromise<TTranslationsRaw>;

export interface ITranslateParams {
  [key: string]: string;
}

export type TTranslateManyValues = { [key: string]: ITranslateParams; } | (string | [string, ITranslateParams])[] | Iterable<string | [string, ITranslateParams]>;

export type TTranslations = Map<string, string>;

export interface ITranslateServiceKeyValueMap extends ILocalizationServiceKeyValueMap {
  'translations-change': void;
}

export interface ICreateTranslationsLoaderOptions {
  set?: boolean;
  strict?: boolean;
}

/** INTERFACE **/

export interface ITranslateService extends ILocalizationService<ITranslateServiceKeyValueMap> {
  getLocale(): string;
  setLocale(locale: string): void;

  setTranslationsLoader(translationsLoaderCallback: TTranslationsLoaderCallback): void;
  createTranslationsLoader(url: string, options?: ICreateTranslationsLoaderOptions): TCreateTranslationsLoaderCallback;

  setTranslations(locale: string, translations: TTranslationsRaw): Promise<TTranslations>;
  getTranslations(locale: string, token?: CancelToken): ICancellablePromise<TTranslations>;
  deleteTranslations(locale: string): Promise<void>;

  translate(key: string, params?: ITranslateParams, locale?: string, token?: CancelToken): ICancellablePromise<string>;
  translateMany(values: TTranslateManyValues, locale?: string, token?: CancelToken): ICancellablePromise<TTranslations>;
}




