import {
  INotificationsObservableContext, KeyValueMapKeys, NotificationsObservable
} from '@lifaon/observables/public';
import { ILocalizationService, ILocalizationServiceKeyValueMap } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../misc/helpers/ClassWithPrivateMembers';


export const LOCALIZATION_SERVICE_PRIVATE = Symbol('localization-service-private');

export interface ILocalizationServicePrivate<TKVMap extends ILocalizationServiceKeyValueMap> {
  context: INotificationsObservableContext<TKVMap>;
  locale: string;
}

export interface ILocalizationServiceInternal<TKVMap extends ILocalizationServiceKeyValueMap> extends ILocalizationService<TKVMap> {
  [LOCALIZATION_SERVICE_PRIVATE]: ILocalizationServicePrivate<TKVMap>;
}

export function ConstructLocalizationService<TKVMap extends ILocalizationServiceKeyValueMap>(service: ILocalizationService<TKVMap>, context: INotificationsObservableContext<TKVMap>): void {
  ConstructClassWithPrivateMembers(service, LOCALIZATION_SERVICE_PRIVATE);
  (service as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].context = context;
  (service as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].locale = null;
  
  LocalizationServiceSetLocale<TKVMap>(service, window.navigator.language || 'en');
}

export function LocalizationServiceSetLocale<TKVMap extends ILocalizationServiceKeyValueMap>(service: ILocalizationService<TKVMap>, locale: string): void {
  (service as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].locale = locale;
  (service as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].context.dispatch('locale-change' as KeyValueMapKeys<TKVMap>);
}

export abstract class LocalizationService<TKVMap extends ILocalizationServiceKeyValueMap> extends NotificationsObservable<TKVMap> implements ILocalizationService<TKVMap> {

  protected constructor() {
    let context: INotificationsObservableContext<TKVMap> = void 0;
    super((_context: INotificationsObservableContext<TKVMap>) => {
      context = _context;
    });
    ConstructLocalizationService(this, context);
  }

  getLocale(): string {
    return ((this as unknown) as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].locale;
  }

  setLocale(locale: string): void {
    return LocalizationServiceSetLocale(this, locale);
  }

}
