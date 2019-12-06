import { ILocalizationService, LocalizationServiceKeyValueMapConstraint } from './interfaces';
import {
  INotificationsObserver, IObservable, IObservableContext, NotificationsObserver, Pipe, Observable
} from '@lifaon/observables';

export function LocalizationServiceLocaleObservable<TKVMap extends LocalizationServiceKeyValueMapConstraint<TKVMap>>(instance: ILocalizationService<TKVMap>): IObservable<string> {
  return instance.pipeThrough(
    new Pipe<INotificationsObserver<'locale-change', string>,
      IObservable<string>>(() => {
      let context: IObservableContext<string>;
      return {
        observer: new NotificationsObserver<'locale-change', string>('locale-change', (value: string) => {
          context.emit(value);
        }),
        observable: new Observable<string>((_context: IObservableContext<string>) => {
          context = _context;
        })
      };
    })
  );
}
