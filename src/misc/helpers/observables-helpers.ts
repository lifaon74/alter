import { IObservable, IObserver, Observable, Observer } from '@lifaon/observables';
import {
  IObservableInternal, IObservablePrivate,
} from '@lifaon/observables/types/core/observable/privates';
import { IObserverInternal, IObserverPrivate } from '@lifaon/observables/types/core/observer/privates';

/** OBSERVABLE **/

export function GetObservablePrivateSymbol(
  instance: IObservable<any> = new Observable()
): symbol {
  const OBSERVABLE_PRIVATE: symbol | undefined = Object.getOwnPropertySymbols(instance).find((_symbol: symbol) => {
    return _symbol.toString().includes('observable-private');
  });
  if (OBSERVABLE_PRIVATE === void 0) {
    throw new Error(`Cannot extract OBSERVABLE_PRIVATE`);
  } else {
    return OBSERVABLE_PRIVATE;
  }
}

let OBSERVABLE_PRIVATE: symbol;

export function GetObservablePrivateSymbolCached(): symbol {
  if (OBSERVABLE_PRIVATE === void 0) {
    OBSERVABLE_PRIVATE = GetObservablePrivateSymbol();
  }
 return OBSERVABLE_PRIVATE;
}

export function GetObservablePrivates<T>(instance: IObservable<T>, noCache: boolean = false): IObservablePrivate<T> {
  return (instance as IObservableInternal<T>)[noCache ? GetObservablePrivateSymbol(instance) : GetObservablePrivateSymbolCached()];
}

/** OBSERVER **/

export function GetObserverPrivateSymbol(
  instance: IObserver<any> = new Observer(() => {})
): symbol {
  const OBSERVER_PRIVATE: symbol | undefined = Object.getOwnPropertySymbols(instance).find((_symbol: symbol) => {
    return _symbol.toString().includes('observer-private');
  });
  if (OBSERVER_PRIVATE === void 0) {
    throw new Error(`Cannot extract OBSERVER_PRIVATE`);
  } else {
    return OBSERVER_PRIVATE;
  }
}

let OBSERVER_PRIVATE: symbol;

export function GetObserverPrivateSymbolCached(): symbol {
  if (OBSERVER_PRIVATE === void 0) {
    OBSERVER_PRIVATE = GetObserverPrivateSymbol();
  }
  return OBSERVER_PRIVATE;
}

export function GetObserverPrivates<T>(instance: IObserver<T>, noCache: boolean = false): IObserverPrivate<T> {
  return (instance as IObserverInternal<T>)[noCache ? GetObserverPrivateSymbol(instance) : GetObserverPrivateSymbolCached()];
}


