import {
  INotificationsObservableContext, KeyValueMapKeys, KeyValueMapValues, NotificationsObservable
} from '@lifaon/observables';
import {
  ILocalizationService, LocalizationServiceKeyValueMapConstraint
} from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../misc/helpers/ClassWithPrivateMembers';

/** PRIVATES **/

export const LOCALIZATION_SERVICE_PRIVATE = Symbol('localization-service-private');

export interface ILocalizationServicePrivate<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> {
  context: INotificationsObservableContext<TKVMap>;
  locale: string;
}

export interface ILocalizationServicePrivatesInternal<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> {
  [LOCALIZATION_SERVICE_PRIVATE]: ILocalizationServicePrivate<TKVMap>;
}

export interface ILocalizationServiceInternal<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> extends ILocalizationServicePrivatesInternal<TKVMap>, ILocalizationService<TKVMap> {
}

/** CONSTRUCTOR **/

export function ConstructLocalizationService<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>>(
  instance: ILocalizationService<TKVMap>,
  context: INotificationsObservableContext<TKVMap>
): void {
  ConstructClassWithPrivateMembers(instance, LOCALIZATION_SERVICE_PRIVATE);
  const privates: ILocalizationServicePrivate<TKVMap> = (instance as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE];
  privates.context = context;
  LocalizationServiceSetLocale<TKVMap>(instance, window.navigator.language || 'en');
}

/** METHODS **/

export function LocalizationServiceGetLocale<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>>(
  instance: ILocalizationService<TKVMap>,
): string {
  return (instance as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE].locale;
}

export function LocalizationServiceSetLocale<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>>(
  instance: ILocalizationService<TKVMap>,
  locale: string
): void {
  const privates: ILocalizationServicePrivate<TKVMap> = (instance as ILocalizationServiceInternal<TKVMap>)[LOCALIZATION_SERVICE_PRIVATE];
  privates.locale = locale;
  privates.context.dispatch('locale-change' as KeyValueMapKeys<TKVMap>, locale as unknown as KeyValueMapValues<TKVMap>);
}



/** CLASS **/

export abstract class LocalizationService<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>> extends NotificationsObservable<TKVMap> implements ILocalizationService<TKVMap> {

  protected constructor() {
    let context: INotificationsObservableContext<TKVMap>;
    super((_context: INotificationsObservableContext<TKVMap>) => {
      context = _context;
    });
    // @ts-ignore
    ConstructLocalizationService<TKVMap>(this, context);
  }

  getLocale(): string {
    return LocalizationServiceGetLocale<TKVMap>(this);
  }

  setLocale(locale: string): void {
    return LocalizationServiceSetLocale<TKVMap>(this, locale);
  }

}
