import {
  ICancellablePromise, IAdvancedAbortSignal
} from '@lifaon/observables';
import { ILocalizationService, ILocalizationServiceKeyValueMap } from '../interfaces';

/** TYPES **/

export type TTranslationsRaw = { [key: string]: string; } | [string, string][] | Iterable<[string, string]>;

export type TTranslationsLoaderCallback = (locale: string, signal?: IAdvancedAbortSignal) => Promise<TTranslationsRaw>;
export type TCreateTranslationsLoaderCallback = (locale: string, signal?: IAdvancedAbortSignal) => ICancellablePromise<TTranslations>;

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
  /**
   * Defines a translationsLoader for this service to call when a list of translations is required
   */
  setTranslationsLoader(translationsLoaderCallback: TTranslationsLoaderCallback): void;

  /**
   * Creates a translationsLoader for this service where 'url' may have the following format for example: '/i18n/{{ locale }}.json'
   */
  createTranslationsLoader(url: string, options?: ICreateTranslationsLoaderOptions): TCreateTranslationsLoaderCallback;

  setTranslations(locale: string, translations: TTranslationsRaw): Promise<TTranslations>;
  getTranslations(locale: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations>;
  deleteTranslations(locale: string): Promise<void>;

  translate(key: string, params?: ITranslateParams, locale?: string, signal?: IAdvancedAbortSignal): ICancellablePromise<string>;
  translateMany(values: TTranslateManyValues, locale?: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations>;
}




