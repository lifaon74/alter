import {
  ICreateTranslationsLoaderOptions, ITranslateParams, ITranslateService, ITranslateServiceKeyValueMap,
  TCreateTranslationsLoaderCallback, TTranslateManyValues, TTranslations, TTranslationsLoaderCallback, TTranslationsRaw
} from './interfaces';
import {
  ILocalizationServicePrivatesInternal, LOCALIZATION_SERVICE_PRIVATE, LocalizationService
} from '../implementation';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IAdvancedAbortSignal } from '@lifaon/observables/types/misc/advanced-abort-controller/advanced-abort-signal/interfaces';
import { AdvancedAbortController, CancellablePromise, ICancellablePromise } from '@lifaon/observables';
import { CreateStrictTranslationLoader, CreateTranslationLoader, ParseTranslation } from './functions';
import { IsObject } from '../../../misc/helpers/is/IsObject';

/** PRIVATES **/

export const TRANSLATE_SERVICE_PRIVATE = Symbol('translate-service-private');

export interface ITranslateServicePrivate {
  translationsLoaderCallback: TTranslationsLoaderCallback | null;
  translations: Map<string, Promise<TTranslations>>;
}

export interface ITranslateServicePrivatesInternal extends ILocalizationServicePrivatesInternal<ITranslateServiceKeyValueMap> {
  [TRANSLATE_SERVICE_PRIVATE]: ITranslateServicePrivate;
}


export interface ITranslateServiceInternal extends ITranslateServicePrivatesInternal, ITranslateService {
}

/** CONSTRUCTOR **/

export function ConstructTranslateService(instance: ITranslateService): void {
  ConstructClassWithPrivateMembers(instance, TRANSLATE_SERVICE_PRIVATE);
  const privates: ITranslateServicePrivate = (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  privates.translationsLoaderCallback = CreateTranslationLoader('/i18n/{{locale}}.json');
  privates.translations = new Map<string, Promise<TTranslations>>();
}

/** METHODS **/

export function TranslateServiceSetTranslationLoader(
  instance: ITranslateService,
  translationsLoaderCallback: TTranslationsLoaderCallback
): void {
  if (typeof translationsLoaderCallback === 'function') {
    (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback = translationsLoaderCallback;
  } else {
    throw new TypeError(`Expected function as translationsLoaderCallback`);
  }
}

export function TranslateServiceCreateTranslationLoader(
  instance: ITranslateService,
  url: string,
  options: ICreateTranslationsLoaderOptions = {}
): TCreateTranslationsLoaderCallback {
  const loader: TCreateTranslationsLoaderCallback = options.strict
    ? CreateStrictTranslationLoader(url)
    : CreateTranslationLoader(url);
  if (options.set) {
    TranslateServiceSetTranslationLoader(instance, loader);
  }
  return loader;
}


export function TranslateServiceSetStaticTranslations(
  instance: ITranslateService,
  locale: string,
  translationsRaw: TTranslationsRaw
): Promise<TTranslations> {
  return TranslateServiceSetTranslationsFromPromise(instance, locale, Promise.resolve(translationsRaw));
}

/*---*/

export function TranslateServiceSetTranslationsFromLoader(
  instance: ITranslateService,
  locale: string,
  signal: IAdvancedAbortSignal = new AdvancedAbortController().signal
): ICancellablePromise<TTranslations> {
  const privates: ITranslateServicePrivate = (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  if (privates.translationsLoaderCallback === null) {
    return CancellablePromise.reject(new Error(`Translations loader missing`), signal) as unknown as ICancellablePromise<TTranslations>;
  } else {
    return new CancellablePromise(
      TranslateServiceSetTranslationsFromPromise(
        instance,
        locale,
        privates.translationsLoaderCallback(locale, signal)
      ),
      signal
    );
  }
}

export function TranslateServiceSetTranslationsFromPromise(
  instance: ITranslateService,
  locale: string,
  rawPromise: Promise<TTranslationsRaw>
): Promise<TTranslations> {
  const privates: ITranslateServicePrivate = (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];

  const promise: Promise<TTranslations> = rawPromise
    .then(NormalizeTranslations)
    .catch((error: any) => {
      privates.translations.delete(locale);
      return Promise.reject(error);
    });

  privates.translations.set(locale, promise);
  (instance as ITranslateServiceInternal)[LOCALIZATION_SERVICE_PRIVATE].context.dispatch('translations-change', void 0);
  return promise;
}

export function NormalizeTranslations(
  translationsRaw: TTranslationsRaw,
  translations: TTranslations = new Map<string, string>()
): TTranslations {
  translations.clear();

  if ((typeof translationsRaw !== 'string') && (Symbol.iterator in translationsRaw)) {
    const iterator: Iterator<[string, string]> = (translationsRaw as Iterable<[string, string]>)[Symbol.iterator]();
    let result: IteratorResult<[string, string]>;
    while (!(result = iterator.next()).done) {
      if (Array.isArray(result.value) && (result.value.length === 2)) {
        translations.set(String(result.value[0]), String(result.value[1]));
      } else {
        throw new TypeError(`Expected [string, string] as value of iterable`);
      }
    }
  } else if (IsObject(translationsRaw)) {
    for (const key in translationsRaw) {
      if (translationsRaw.hasOwnProperty(key)) {
        translations.set(key, String((translationsRaw as { [key: string]: string; })[key]));
      }
    }
  } else {
    throw new TypeError(`Expected object or iterable as translations`);
  }

  return translations;
}

/*---*/

export function TranslateServiceGetTranslations(
  instance: ITranslateService,
  locale: string,
  signal: IAdvancedAbortSignal = new AdvancedAbortController().signal
): ICancellablePromise<TTranslations> {
  const privates: ITranslateServicePrivate = (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  if (privates.translations.has(locale)) {
    return new CancellablePromise(privates.translations.get(locale) as Promise<TTranslations>, signal);
  } else {
    if (privates.translationsLoaderCallback === null) {
      return CancellablePromise.reject(new Error(`Translations missing for '${ locale }'`), signal) as unknown as ICancellablePromise<TTranslations>;
    } else {
      return TranslateServiceSetTranslationsFromLoader(instance, locale);
    }
  }
}

export function TranslateServiceDeleteTranslations(
  instance: ITranslateService,
  locale: string
): Promise<void> {
  (instance as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations.delete(locale);
  (instance as ITranslateServiceInternal)[LOCALIZATION_SERVICE_PRIVATE].context.dispatch('translations-change', void 0);
  return Promise.resolve();
}

export function TranslateServiceTranslate(
  instance: ITranslateService,
  key: string,
  params?: ITranslateParams,
  locale: string = instance.getLocale(),
  signal?: IAdvancedAbortSignal
): ICancellablePromise<string> {
  return TranslateServiceGetTranslations(instance, locale, signal)
    .then((translations: TTranslations) => {
      return translations.has(key)
        ? ParseTranslation(translations.get(key) as string, params)
        : key;
    });
}


export function TranslateServiceTranslateMany(
  instance: ITranslateService,
  values: TTranslateManyValues,
  locale: string = instance.getLocale(),
  signal?: IAdvancedAbortSignal
): ICancellablePromise<TTranslations> {
  return TranslateServiceGetTranslations(instance, locale, signal)
    .then((translations: TTranslations) => {
      const map: TTranslations = new Map<string, string>();

      if ((typeof values !== 'string') && (Symbol.iterator in values)) {
        const iterator: Iterator<string | [string, ITranslateParams]> = (values as Iterable<string | [string, ITranslateParams]>)[Symbol.iterator]();
        let result: IteratorResult<string | [string, ITranslateParams]>;
        while (!(result = iterator.next()).done) {
          if (Array.isArray(result.value) && (result.value.length === 2)) {
            const key: string = String(result.value[0]);
            map.set(
              key,
              translations.has(key)
                ? ParseTranslation(translations.get(key) as string, result.value[1])
                : key
            );
          } else if (typeof result.value === 'string') {
            map.set(
              result.value,
              translations.has(result.value)
                ? translations.get(result.value) as string
                : result.value
            );
          } else {
            throw new TypeError(`Expected [string, string] or string as value of iterable`);
          }
        }
      } else if (IsObject(values)) {
        for (const key in values) {
          if (values.hasOwnProperty(key)) {
            map.set(
              key,
              translations.has(key)
                ? ParseTranslation(translations.get(key) as string, (values as { [key: string]: ITranslateParams; })[key])
                : key
            );
          }
        }
      } else {
        throw new TypeError(`Expected object or iterable as translations`);
      }

      return map;
    });
}


/** CLASS **/

export class TranslateService extends LocalizationService<ITranslateServiceKeyValueMap> implements ITranslateService {

  constructor() {
    super();
    ConstructTranslateService(this);
  }

  setTranslationsLoader(translationsLoaderCallback: TTranslationsLoaderCallback): void {
    return TranslateServiceSetTranslationLoader(this, translationsLoaderCallback);
  }

  createTranslationsLoader(url: string, options?: ICreateTranslationsLoaderOptions): TCreateTranslationsLoaderCallback {
    return TranslateServiceCreateTranslationLoader(this, url, options);
  }

  setTranslations(locale: string, translations: TTranslationsRaw): Promise<TTranslations> {
    return TranslateServiceSetStaticTranslations(this, locale, translations);
  }

  getTranslations(locale: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations> {
    return TranslateServiceGetTranslations(this, locale, signal);
  }

  deleteTranslations(locale: string): Promise<void> {
    return TranslateServiceDeleteTranslations(this, locale);
  }

  translate(key: string, params?: ITranslateParams, locale?: string, signal?: IAdvancedAbortSignal): ICancellablePromise<string> {
    return TranslateServiceTranslate(this, key, params, locale, signal);
  }

  translateMany(values: TTranslateManyValues, locale?: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations> {
    return TranslateServiceTranslateMany(this, values, locale, signal);
  }
}


export const translateService: ITranslateService = new TranslateService();


