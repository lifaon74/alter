import { ITranslateSource } from './interfaces';
import { ITranslateParams, ITranslateServiceKeyValueMap } from '../service/interfaces';
import { translateService } from '../service/implementation';
import { ASYNC_SOURCE_PRIVATE, AsyncSource, AsyncSourceEmit, IAsyncSourcePrivate } from '@lifaon/observables/observables/distinct/source/implementation';
import { IObservablePrivate, OBSERVABLE_PRIVATE } from '@lifaon/observables/core/observable/implementation';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IObserver, IPromiseCancelToken, KeyValueMapToNotifications } from '@lifaon/observables/public';


export const TRANSLATE_SOURCE_PRIVATE = Symbol('translate-source-private');

export interface ITranslateSourcePrivate {
  value: string | undefined;
  params: ITranslateParams | null;
  emitPromise: Promise<ITranslateSource>;
}

export interface ITranslateSourceInternal extends ITranslateSource {
  [TRANSLATE_SOURCE_PRIVATE]: ITranslateSourcePrivate;
  [ASYNC_SOURCE_PRIVATE]: IAsyncSourcePrivate<string>;
  [OBSERVABLE_PRIVATE]: IObservablePrivate<string>;
}

export function ConstructTranslateSource(source: ITranslateSource): void {
  ConstructClassWithPrivateMembers(source, TRANSLATE_SOURCE_PRIVATE);
  (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].value = void 0;
  (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].params = null;
  (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].emitPromise = Promise.resolve(this);

  const localeChangeObserver: IObserver<KeyValueMapToNotifications<ITranslateServiceKeyValueMap>> = translateService
    .pipeTo((notification: KeyValueMapToNotifications<ITranslateServiceKeyValueMap>) => {
      switch (notification.name) {
        case 'translations-change':
        case 'locale-change':
          TranslateSourceEmitSuper(source);
          break;
      }
    });


  const onObserveHook = (source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].onObserveHook;
  (source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].onObserveHook = (observer: IObserver<string>) => {
    if ((source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].observers.length === 1) {
      localeChangeObserver.activate();
      TranslateSourceEmitSuper(source);
    }
    onObserveHook(observer);
  };

  const onUnobserveHook = (source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].onUnobserveHook;
  (source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].onUnobserveHook = (observer: IObserver<string>) => {
    if ((source as ITranslateSourceInternal)[OBSERVABLE_PRIVATE].observers.length === 0) {
      localeChangeObserver.deactivate();
    }
    onUnobserveHook(observer);
  };

}

export function TranslateSourceEmit<S extends ITranslateSource>(source: S, value: string, params?: ITranslateParams): Promise<S> {
  const privates: ITranslateSourcePrivate = ((source as unknown) as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE];
  if (
    (value !== privates.value)
    || (JSON.stringify(params) !== JSON.stringify(privates.params))
  ) {
    privates.value = value;
    privates.params = Object.assign({}, params);
    TranslateSourceEmitSuper(source);
  }
  return privates.emitPromise as Promise<S>;
}

function TranslateSourceEmitSuper(source: ITranslateSource): void {
  (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].emitPromise = AsyncSourceEmit<string, ITranslateSource>(
    source,
    translateService.translate(
      (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].value,
      (source as ITranslateSourceInternal)[TRANSLATE_SOURCE_PRIVATE].params
    )
  ).catch((error: any) => {
    console.warn(('message' in error) ? error.message : error);
    return source;
  });
}

export class TranslateSource extends AsyncSource<string> implements ITranslateSource {
  constructor() {
    super();
    ConstructTranslateSource(this);
  }

  emit(value: string, params?: ITranslateParams): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
  emit(valueOrPromise: any, paramsOrToken: any): Promise<this | never> {
    if (typeof valueOrPromise === 'string') {
      return TranslateSourceEmit<this>(this, valueOrPromise, paramsOrToken);
    } else {
      return Promise.reject(new Error(`Cannot call TranslateSource.emit with a promise as first argument.`));
      // return super.emit(valueOrPromise, paramsOrToken);
    }
  }
}

// INFO think about some "DynamicFunction" a function which takes observables as input and returns another observable from it
// export function $translate(value: string/* | ISource<string>*/, params?: ITranslateParams/* | ISource<ITranslateParams>*/): ITranslateSource {
//   const source: ITranslateSource = new TranslateSource();
//   source.emit(value, params).catch();
//   return source;
// }

export async function testTranslateSource() {
  await translateService.setTranslations('en', {
    name: 'My name: {{ name }}'
  });
  await translateService.setTranslations('fr', {
    name: 'Mon nom: {{ name }}'
  });
  translateService.setLocale('fr');

  const source = new TranslateSource();

  source.pipeTo((value: string) => {
    console.log(value);
  }).activate();

  await source.emit('name', { name: 'Alice' });
  // await source.emit(Promise.resolve('a'));

  translateService.setLocale('en');
}
