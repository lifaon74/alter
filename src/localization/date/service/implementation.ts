import { INotificationsObservableContext } from '../../../../notifications/core/notifications-observable/interfaces';
import { IDateService, IDateServiceKeyValueMap } from './interfaces';
import { INotificationsObservableInternal, NotificationsObservable } from '../../../../notifications/core/notifications-observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';



export const DATE_SERVICE_PRIVATE = Symbol('date-service-private');

export interface IDateServicePrivate {
  context: INotificationsObservableContext<IDateServiceKeyValueMap>;
  locale: string;
}

export interface IDateServiceInternal extends IDateService, INotificationsObservableInternal<IDateServiceKeyValueMap> {
  [DATE_SERVICE_PRIVATE]: IDateServicePrivate;
}

export function ConstructDateService(service: IDateService, context: INotificationsObservableContext<IDateServiceKeyValueMap>): void {
  ConstructClassWithPrivateMembers(service, DATE_SERVICE_PRIVATE);
  (service as IDateServiceInternal)[DATE_SERVICE_PRIVATE].context = context;
  (service as IDateServiceInternal)[DATE_SERVICE_PRIVATE].locale = null;
  DateServiceSetLocale(service, window.navigator.language || 'en');
}


export function DateServiceSetLocale(service: IDateService, locale: string): void {
  (service as IDateServiceInternal)[DATE_SERVICE_PRIVATE].locale = locale;
  (service as IDateServiceInternal)[DATE_SERVICE_PRIVATE].context.dispatch('locale-change');
}


interface ITemporaryFormatter {
  formatter: Intl.DateTimeFormat;
  timer: any | null;
}

const cachedDateTimeFormat: Map<string, ITemporaryFormatter> = new Map<string, ITemporaryFormatter>();
export function DateServiceFormat(service: IDateService, date: number | Date, options?: Intl.DateTimeFormatOptions, locale?: string): Promise<string> {
  if (locale === void 0) {
    locale = (service as IDateServiceInternal)[DATE_SERVICE_PRIVATE].locale;
  }
  const key: string = locale + '-' + JSON.stringify(options);
  if (!cachedDateTimeFormat.has(key)) {
    cachedDateTimeFormat.set(key, {
      formatter: new Intl.DateTimeFormat(locale, options),
      timer: null
    });
  }

  const tempFormatter: ITemporaryFormatter = cachedDateTimeFormat.get(key);
  if (tempFormatter.timer !== null) {
    clearTimeout(tempFormatter.timer);
  }
  tempFormatter.timer = setTimeout(() => {
    cachedDateTimeFormat.delete(key);
  }, 60000);
  // return Promise.resolve(new Intl.DateTimeFormat(locale, options).format(date));
  return Promise.resolve(tempFormatter.formatter.format(date));
}



export class DateService extends NotificationsObservable<IDateServiceKeyValueMap> implements IDateService {

  constructor() {
    let context: INotificationsObservableContext<IDateServiceKeyValueMap> = void 0;
    super((_context: INotificationsObservableContext<IDateServiceKeyValueMap>) => {
      context = _context;
    });
    ConstructDateService(this, context);
  }

  getLocale(): string {
    return ((this as unknown) as IDateServiceInternal)[DATE_SERVICE_PRIVATE].locale;
  }

  setLocale(locale: string): void {
    return DateServiceSetLocale(this, locale);
  }

  format(date: number | Date, options?: Intl.DateTimeFormatOptions, locale?: string): Promise<string> {
    return DateServiceFormat(this, date, options, locale);
  }

}


export const dateService: IDateService = new DateService();


