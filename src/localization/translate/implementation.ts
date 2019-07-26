import {
  ICreateTranslationsLoaderOptions, ITranslateParams, ITranslateService, ITranslateServiceKeyValueMap,
  TCreateTranslationsLoaderCallback, TTranslateManyValues,
  TTranslations, TTranslationsLoaderCallback, TTranslationsRaw
} from './interfaces';
import {
  CancellablePromise, ICancellablePromise, INotificationsObservableContext, ICancelToken,
  NotificationsObservable, CancelToken
} from '@lifaon/observables/public';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';
import { IsObject } from '../../helpers';
import { ILocalizationService } from '../interfaces';
import { ILocalizationServiceInternal, LOCALIZATION_SERVICE_PRIVATE, LocalizationService } from '../implementation';


export const TRANSLATE_SERVICE_PRIVATE = Symbol('translate-service-private');

export interface ITranslateServicePrivate {
  translationsLoaderCallback: TTranslationsLoaderCallback | null;
  translations: Map<string, Promise<TTranslations>>;
}

export interface ITranslateServiceInternal extends ITranslateService, ILocalizationServiceInternal<ITranslateServiceKeyValueMap> {
  [TRANSLATE_SERVICE_PRIVATE]: ITranslateServicePrivate;
}

export function ConstructTranslateService(service: ITranslateService): void {
  ConstructClassWithPrivateMembers(service, TRANSLATE_SERVICE_PRIVATE);
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback = CreateTranslationLoader('/i18n/{{locale}}.json');
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations = new Map<string, Promise<TTranslations>>();
}




export function TranslateServiceSetTranslationLoader(service: ITranslateService, translationsLoaderCallback: TTranslationsLoaderCallback): void {
  if (typeof translationsLoaderCallback === 'function') {
    (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback = translationsLoaderCallback;
  } else {
    throw new TypeError(`Expected function as translationsLoaderCallback`);
  }
}

export function FetchTranslation(url: string, locale: string, token?: ICancelToken): ICancellablePromise<TTranslations> {
  url = url.replace(/\{\{ *locale *\}\}/g, locale);
  return new CancellablePromise(fetch(url, (token === void 0) ? void 0 : { signal: token.toAbortController().signal }), token)
    .then((response: Response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Cannot load url: '${url}'`);
      }
    });
}

export function CreateTranslationLoader(url: string): TCreateTranslationsLoaderCallback {
  return (locale: string, token?: ICancelToken): ICancellablePromise<TTranslations> => {
    return FetchTranslation(url, locale, token)
      .catch((error: any) => {
        // give another try in case
        const _locale: string = locale.split(/[_\-]/)[0];
        if (_locale === locale) {
          throw error;
        } else {
          return FetchTranslation(url, _locale, token);
        }
      });
  };
}

export function CreateStrictTranslationLoader(url: string): TCreateTranslationsLoaderCallback {
  return (locale: string, token?: ICancelToken): ICancellablePromise<TTranslations> => {
    return FetchTranslation(url, locale, token);
  };
}


export function TranslateServiceCreateTranslationLoader(service: ITranslateService, url: string, options: ICreateTranslationsLoaderOptions = {}): TCreateTranslationsLoaderCallback {
  const loader: TCreateTranslationsLoaderCallback = options.strict ? CreateStrictTranslationLoader(url) : CreateTranslationLoader(url);
  if (options.set) {
    TranslateServiceSetTranslationLoader(service, loader);
  }
  return loader;
}


export function TranslateServiceSetStaticTranslations(service: ITranslateService, locale: string, translationsRaw: TTranslationsRaw): Promise<TTranslations> {
  return TranslateServiceSetTranslationsFromPromise(service, locale, Promise.resolve(translationsRaw));
}

export function TranslateServiceSetTranslationsFromLoader(service: ITranslateService, locale: string, token?: CancelToken): ICancellablePromise<TTranslations> {
  return new CancellablePromise(
    TranslateServiceSetTranslationsFromPromise(
      service,
      locale,
      (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback(locale, token)
    ),
    token
  );
}

export function TranslateServiceSetTranslationsFromPromise(service: ITranslateService, locale: string, rawPromise: Promise<TTranslationsRaw>): Promise<TTranslations> {
  const promise: Promise<TTranslations> = rawPromise
    .then((translationsRaw: TTranslationsRaw) => {
      return NormalizeTranslations(translationsRaw);
    })
    .catch((error: any) => {
      (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations.delete(locale);
      return Promise.reject(error);
    });
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations.set(locale, promise);
  (service as ITranslateServiceInternal)[LOCALIZATION_SERVICE_PRIVATE].context.dispatch('translations-change', void 0);
  return promise;
}

export function NormalizeTranslations(translationsRaw: TTranslationsRaw, translations: TTranslations = new Map<string, string>()): TTranslations {
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
  } else if ((typeof translationsRaw === 'object') && (translationsRaw !== null)) {
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


export function TranslateServiceGetTranslations(service: ITranslateService, locale: string, token?: CancelToken): ICancellablePromise<TTranslations> {
  const privates: ITranslateServicePrivate = (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  if (privates.translations.has(locale)) {
    return new CancellablePromise(privates.translations.get(locale), token);
  } else {
    if (privates.translationsLoaderCallback === null) {
      return CancellablePromise.reject(new Error(`Translations missing for '${locale}'`), token);
    } else {
      return TranslateServiceSetTranslationsFromLoader(service, locale);
    }
  }
}

export function TranslateServiceDeleteTranslations(service: ITranslateService, locale: string): Promise<void> {
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations.delete(locale);
  (service as ITranslateServiceInternal)[LOCALIZATION_SERVICE_PRIVATE].context.dispatch('translations-change', void 0);
  return Promise.resolve();
}

export function TranslateServiceTranslate(
  service: ITranslateService,
  key: string,
  params?: ITranslateParams,
  locale: string = service.getLocale(),
  token?: CancelToken
): ICancellablePromise<string> {
  return TranslateServiceGetTranslations(service, locale, token)
    .then((translations: TTranslations) => {
      return translations.has(key)
        ? ParseTranslation(translations.get(key), params)
        : key;
    });
}


export function TranslateServiceTranslateMany(
  service: ITranslateService,
  values: TTranslateManyValues,
  locale: string = service.getLocale(),
  token?: CancelToken
): ICancellablePromise<TTranslations> {
  return TranslateServiceGetTranslations(service, locale, token)
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
                ? ParseTranslation(translations.get(key), result.value[1])
                : key
            );
          } else if (typeof result.value === 'string') {
            map.set(
              result.value,
              translations.has(result.value)
                ? translations.get(result.value)
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
                ? ParseTranslation(translations.get(key), (values as { [key: string]: ITranslateParams; })[key])
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


const translateVariableRegExp = new RegExp('\\{\\{ *(\\w+) *\\}\\}', 'g');
export function ParseTranslation(value: string, params?: ITranslateParams): string {
  if ((params === void 0) || (params === null)) {
    params = {};
  } else if (typeof  params !== 'object') {
    throw new Error('Expected { [key: string]: string } as params');
  }
  return value.replace(translateVariableRegExp, (match: string, variable: string) => {
    return params.hasOwnProperty(variable)
      ? String(params[variable])
      : match;
  });
}


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

  getTranslations(locale: string, token?: CancelToken): ICancellablePromise<TTranslations> {
    return TranslateServiceGetTranslations(this, locale);
  }

  deleteTranslations(locale: string): Promise<void> {
    return TranslateServiceDeleteTranslations(this, locale);
  }

  translate(key: string, params?: ITranslateParams, locale?: string, token?: CancelToken): ICancellablePromise<string> {
    return TranslateServiceTranslate(this, key, params, locale, token);
  }

  translateMany(values: TTranslateManyValues, locale?: string, token?: CancelToken): ICancellablePromise<TTranslations> {
    return TranslateServiceTranslateMany(this, values, locale, token);
  }
}


export const translateService: ITranslateService = new TranslateService();


