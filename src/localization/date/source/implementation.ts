import { ASYNC_SOURCE_PRIVATE, AsyncSource, AsyncSourceEmit, IAsyncSourcePrivate } from '../../../../observables/source/implementation';
import { IDateFormatSource } from './interfaces';
import { IPromiseCancelToken } from '../../../../notifications/observables/promise-observable/promise-cancel-token/interfaces';
import { IObservablePrivate, OBSERVABLE_PRIVATE } from '../../../../core/observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { IObserver } from '../../../../core/observer/interfaces';
import { dateService } from '../service/implementation';
import { IDateServiceKeyValueMap } from '../service/interfaces';
import { INotificationsObserver } from '../../../../notifications/core/notifications-observer/interfaces';

export const DATE_FORMAT_SOURCE_PRIVATE = Symbol('date-format-source-private');

export interface IDateFormatSourcePrivate {
  date: number;
  options: Intl.DateTimeFormatOptions | null;
  stringifiedOptions: string | null;
  emitPromise: Promise<IDateFormatSource>;
}

export interface IDateFormatSourceInternal extends IDateFormatSource {
  [DATE_FORMAT_SOURCE_PRIVATE]: IDateFormatSourcePrivate;
  [ASYNC_SOURCE_PRIVATE]: IAsyncSourcePrivate<string>;
  [OBSERVABLE_PRIVATE]: IObservablePrivate<string>;
}

export function ConstructDateFormatSource(source: IDateFormatSource): void {
  ConstructClassWithPrivateMembers(source, DATE_FORMAT_SOURCE_PRIVATE);
  (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].date = void 0;
  (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].options = null;
  (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].stringifiedOptions = null;
  (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].emitPromise = Promise.resolve(this);

  const localeChangeObserver: INotificationsObserver<IDateServiceKeyValueMap> = dateService
    .addListener('locale-change', () => {
      DateFormatSourceEmitSuper(source);
    });


  const onObserveHook = (source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].onObserveHook = (observer: IObserver<string>) => {
    if ((source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].observers.length === 1) {
      localeChangeObserver.activate();
      DateFormatSourceEmitSuper(source);
    }
    onObserveHook(observer);
  };

  const onUnobserveHook = (source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].onUnobserveHook;
  (source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].onUnobserveHook = (observer: IObserver<string>) => {
    if ((source as IDateFormatSourceInternal)[OBSERVABLE_PRIVATE].observers.length === 0) {
      localeChangeObserver.deactivate();
    }
    onUnobserveHook(observer);
  };

}

export function DateFormatSourceEmit<S extends IDateFormatSource>(source: S, date: number | Date, options?: Intl.DateTimeFormatOptions): Promise<S> {
  if (typeof (date as Date).getTime === 'function') {
    date = (date as Date).getTime();
  }

  const privates: IDateFormatSourcePrivate = ((source as unknown) as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE];
  if (
    (date !== privates.date)
    || (JSON.stringify(options) !== privates.stringifiedOptions)
  ) {
    privates.date = (date as number);
    privates.options = Object.assign({}, options);
    privates.stringifiedOptions = JSON.stringify(privates.options);
    DateFormatSourceEmitSuper(source);
  }
  return privates.emitPromise as Promise<S>;
}

function DateFormatSourceEmitSuper(source: IDateFormatSource): void {
  if ((source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].date !== void 0) {
    (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].emitPromise = AsyncSourceEmit<string, IDateFormatSource>(
      source,
      dateService.format(
        (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].date,
        (source as IDateFormatSourceInternal)[DATE_FORMAT_SOURCE_PRIVATE].options || (void 0)
      )
    ).catch((error: any) => {
      console.warn(('message' in error) ? error.message : error);
      return source;
    });
  }
}

export class DateFormatSource extends AsyncSource<string> implements IDateFormatSource {
  constructor() {
    super();
    ConstructDateFormatSource(this);
  }

  emit(date: number | Date, options?: Intl.DateTimeFormatOptions): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
  emit(valueOrPromise: any, paramsOrToken: any): Promise<this | never> {
    if ((typeof valueOrPromise === 'number') || (typeof valueOrPromise.getTime === 'function')) {
      return DateFormatSourceEmit<this>(this, valueOrPromise, paramsOrToken);
    } else {
      return Promise.reject(new Error(`Cannot call DateFormatSource.emit with a promise as first argument.`));
      // return super.emit(valueOrPromise, paramsOrToken);
    }
  }
}
