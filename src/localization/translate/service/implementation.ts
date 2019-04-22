import { ITranslateParams, ITranslateService, ITranslateServiceKeyValueMap, TTranslateMany, TTranslations, TTranslationsLoaderCallback, TTranslationsRaw } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { INotificationsObservableInternal, NotificationsObservable } from '../../../../notifications/core/notifications-observable/implementation';
import { INotificationsObservableContext } from '../../../../notifications/core/notifications-observable/interfaces';
import { IPromiseCancelToken } from '../../../../notifications/observables/promise-observable/promise-cancel-token/interfaces';
import { PromiseCancelToken } from '../../../../notifications/observables/promise-observable/promise-cancel-token/implementation';


export const TRANSLATE_SERVICE_PRIVATE = Symbol('translate-service-private');

export interface ITranslateServicePrivate {
  context: INotificationsObservableContext<ITranslateServiceKeyValueMap>;
  locale: string;
  translationsLoaderCallback: TTranslationsLoaderCallback | null;
  translations: Map<string, Promise<TTranslations>>;
}

export interface ITranslateServiceInternal extends ITranslateService, INotificationsObservableInternal<ITranslateServiceKeyValueMap> {
  [TRANSLATE_SERVICE_PRIVATE]: ITranslateServicePrivate;
}

export function ConstructTranslateService(service: ITranslateService, context: INotificationsObservableContext<ITranslateServiceKeyValueMap>): void {
  ConstructClassWithPrivateMembers(service, TRANSLATE_SERVICE_PRIVATE);
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].context = context;
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].locale = null;
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback = CreateTranslationLoader('/i18n/{{locale}}.json');
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations = new Map<string, Promise<TTranslations>>();
  TranslateServiceSetLocale(service, window.navigator.language || 'en');
}


export function TranslateServiceSetLocale(service: ITranslateService, locale: string): void {
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].locale = locale;
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].context.dispatch('locale-change', locale);
}


export function TranslateServiceSetTranslationLoader(service: ITranslateService, translationsLoaderCallback: TTranslationsLoaderCallback): void {
  if (typeof translationsLoaderCallback === 'function') {
    (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translationsLoaderCallback = translationsLoaderCallback;
  } else {
    throw new TypeError(`Expected function as translationsLoaderCallback`);
  }
}

export function CreateTranslationLoader(url: string): TTranslationsLoaderCallback {
  return (locale: string, token?: IPromiseCancelToken) => {
    url = url.replace(/\{\{ *locale *\}\}/g, locale);
    return fetch(url, (token === void 0) ? void 0 : { signal: token.toAbortController().signal })
      .then((response: Response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Cannot load url: '${url}'`);
        }
      });
  };
}

export function TranslateServiceCreateTranslationLoader(service: ITranslateService, url: string, set: boolean = false): TTranslationsLoaderCallback {
  const loader: TTranslationsLoaderCallback = CreateTranslationLoader(url);
  if (set) {
    TranslateServiceSetTranslationLoader(service, loader);
  }
  return loader;
}


export function TranslateServiceSetStaticTranslations(service: ITranslateService, locale: string, translationsRaw: TTranslationsRaw): Promise<TTranslations> {
  return TranslateServiceSetTranslationsFromPromise(service, locale, Promise.resolve(translationsRaw));
}

export function TranslateServiceSetTranslationsFromLoader(service: ITranslateService, locale: string, token?: PromiseCancelToken): Promise<TTranslations> {
  const privates: ITranslateServicePrivate = (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  if (privates.translationsLoaderCallback === null) {
    return Promise.reject(new Error(`Translations missing for '${locale}'`));
  } else {
    return TranslateServiceSetTranslationsFromPromise(service, locale, privates.translationsLoaderCallback(locale, token));
  }
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
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].context.dispatch('translations-change');
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


export function TranslateServiceGetTranslations(service: ITranslateService, locale: string, token?: PromiseCancelToken): Promise<TTranslations> {
  const privates: ITranslateServicePrivate = (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE];
  if (privates.translations.has(locale)) {
    return privates.translations.get(locale);
  } else {
    if (privates.translationsLoaderCallback === null) {
      return Promise.reject(new Error(`Translations missing for '${locale}'`));
    } else {
      return TranslateServiceSetTranslationsFromLoader(service, locale, token);
    }
  }
}

export function TranslateServiceDeleteTranslations(service: ITranslateService, locale: string): Promise<void> {
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].translations.delete(locale);
  (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].context.dispatch('translations-change');
  return Promise.resolve();
}

export function TranslateServiceTranslate(service: ITranslateService, key: string, params?: ITranslateParams, locale?: string, token?: PromiseCancelToken): Promise<string> {
  if (locale === void 0) {
    locale = (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].locale;
  }
  return TranslateServiceGetTranslations(service, locale, token)
    .then((translations: TTranslations) => {
      if (token.cancelled) {
        throw token.reason;
      } else {
        return translations.has(key)
          ? ParseTranslation(translations.get(key), params)
          : key;
      }
    });
}


export function TranslateServiceTranslateMany(service: ITranslateService, values: TTranslateMany, locale?: string, token?: PromiseCancelToken): Promise<TTranslations> {
  if (locale === void 0) {
    locale = (service as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].locale;
  }
  return TranslateServiceGetTranslations(service, locale, token)
    .then((translations: TTranslations) => {
      if (token.cancelled) {
        throw token.reason;
      } else {
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
        } else if ((typeof values === 'object') && (values !== null)) {
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
      }
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


export class TranslateService extends NotificationsObservable<ITranslateServiceKeyValueMap> implements ITranslateService {

  constructor() {
    let context: INotificationsObservableContext<ITranslateServiceKeyValueMap> = void 0;
    super((_context: INotificationsObservableContext<ITranslateServiceKeyValueMap>) => {
      context = _context;
    });
    ConstructTranslateService(this, context);
  }

  getLocale(): string {
    return ((this as unknown) as ITranslateServiceInternal)[TRANSLATE_SERVICE_PRIVATE].locale;
  }

  setLocale(locale: string): void {
    return TranslateServiceSetLocale(this, locale);
  }

  setTranslationsLoader(translationsLoaderCallback: TTranslationsLoaderCallback): void {
    return TranslateServiceSetTranslationLoader(this, translationsLoaderCallback);
  }

  createTranslationsLoader(url: string, set?: boolean): TTranslationsLoaderCallback {
    return TranslateServiceCreateTranslationLoader(this, url, set);
  }

  setTranslations(locale: string, translations: TTranslationsRaw): Promise<TTranslations> {
    return TranslateServiceSetStaticTranslations(this, locale, translations);
  }

  getTranslations(locale: string, token?: PromiseCancelToken): Promise<TTranslations> {
    return TranslateServiceGetTranslations(this, locale);
  }

  deleteTranslations(locale: string): Promise<void> {
    return TranslateServiceDeleteTranslations(this, locale);
  }

  translate(key: string, params?: ITranslateParams, locale?: string, token?: PromiseCancelToken): Promise<string> {
    return TranslateServiceTranslate(this, key, params, locale, token);
  }

  translateMany(values: TTranslateMany, locale?: string, token?: PromiseCancelToken): Promise<TTranslations> {
    return TranslateServiceTranslateMany(this, values, locale, token);
  }
}


export const translateService: ITranslateService = new TranslateService();


// INFO create a translatePipe ?


export async function testTranslateService() {
  await translateService.setTranslations('fr', {
    a: 'a {{ a }} b'
  });
  translateService.setLocale('fr');

  // console.log(await translateService.getTranslations('fr'));
  // console.log(await translateService.translate('a', { a: 'hello' }));
  // console.log(await translateService.translateMany(['a']));
  console.log(await translateService.translateMany([['a', { a: 'hello' }]]));
}


