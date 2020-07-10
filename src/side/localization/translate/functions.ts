import {
  AdvancedAbortController, CancellablePromise, ICancellablePromise, IAdvancedAbortSignal, IObservable, Pipe,
  INotificationsObserver, IObservableContext, NotificationsObserver, Observable
} from '@lifaon/observables';
import { ITranslateParams, ITranslateService, TCreateTranslationsLoaderCallback, TTranslations } from './interfaces';
import { uuid } from '../../../misc/helpers/uuid';

/** FUNCTIONS **/

/**
 * Fetches a translations file after replacing the '{{ locale }}' pattern from 'url' by 'locale'
 */
export function FetchTranslation(
  url: string,
  locale: string,
  signal: IAdvancedAbortSignal = new AdvancedAbortController().signal
): ICancellablePromise<TTranslations> {
  url = url.replace(/\{\{ *locale *\}\}/g, locale);
  return CancellablePromise.fetch(url, void 0, { signal })
    .then((response: Response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Cannot load url: '${ url }'`);
      }
    });
}

/**
 * Creates a translations loader from a specific 'url'
 *  - if translations are not found, try with a shorter locale
 */
export function CreateTranslationLoader(url: string): TCreateTranslationsLoaderCallback {
  return (locale: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations> => {
    return FetchTranslation(url, locale, signal)
      .catch((error: any) => {
        // give another try in case
        const _locale: string = locale.split(/[_\-]/)[0];
        if (_locale === locale) {
          throw error;
        } else {
          return FetchTranslation(url, _locale, signal);
        }
      });
  };
}

/**
 * Creates a translations loader from a specific 'url'
 */
export function CreateStrictTranslationLoader(url: string): TCreateTranslationsLoaderCallback {
  return (locale: string, signal?: IAdvancedAbortSignal): ICancellablePromise<TTranslations> => {
    return FetchTranslation(url, locale, signal);
  };
}



const TRANSLATE_VARIABLE_REG_EXP = new RegExp('\\{\\{ *(\\w+) *\\}\\}', 'g');

export function ParseTranslation(value: string, params?: ITranslateParams): string {
  if ((params === void 0) || (params === null)) {
    params = {};
  } else if (typeof params !== 'object') {
    throw new Error('Expected { [key: string]: string } as params');
  }
  return value.replace(TRANSLATE_VARIABLE_REG_EXP, (match: string, variable: string) => {
    return (params as ITranslateParams).hasOwnProperty(variable)
      ? String((params as ITranslateParams)[variable])
      : match;
  });
}


export function TranslateServiceTranslationsChangeObservable(instance: ITranslateService): IObservable<string> {
  return instance.pipeThrough(
    new Pipe<INotificationsObserver<'translations-change', void>,
      IObservable<string>>(() => {
      let context: IObservableContext<string>;
      return {
        observer: new NotificationsObserver<'translations-change', void>('translations-change', (value: void) => {
          context.emit(uuid());
        }),
        observable: new Observable<string>((_context: IObservableContext<string>) => {
          context = _context;
        })
      };
    })
  );
}

