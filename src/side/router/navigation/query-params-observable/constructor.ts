import { IQueryParamsObservable } from './interfaces';
import { IObservableContext, ReadonlyList } from '@lifaon/observables';
import { IQueryParamsObservableOptions, TQueryParamChanges } from './types';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import {
  IQueryParamsObservableInternal, IQueryParamsObservablePrivate, QUERY_PARAMS_OBSERVABLE_PRIVATE
} from './privates';
import { IsObject } from '../../../../misc/helpers/is/IsObject';
import { navigation } from '../implementation';
import { GetQueryParamChanges, QueryParamChanged } from './functions';

/** CONSTRUCTOR **/

export function ConstructQueryParamsObservable<TParams extends string>(
  instance: IQueryParamsObservable<TParams>,
  context: IObservableContext<TQueryParamChanges<TParams>>,
  options: IQueryParamsObservableOptions<TParams> = {}
): void {
  ConstructClassWithPrivateMembers(instance, QUERY_PARAMS_OBSERVABLE_PRIVATE);
  const privates: IQueryParamsObservablePrivate<TParams> = (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];

  if (IsObject(options)) {
    privates.context = context;

    if (options.names === void 0) {
      privates.names = void 0;
    } else if (Symbol.iterator in options.names) {
      const names: TParams[] = Array.from(options.names);
      for (let i = 0, l = names.length; i < l; i++) {
        if (typeof names[i] !== 'string') {
          throw new TypeError(`Expected string at index #${ i } of options.names`);
        }
      }
      privates.names = (names.length === 0) ? void 0 : names;
    } else {
      throw new TypeError(`Expected iterable as options.names`);
    }

    privates.readonlyNames = (privates.names === void 0)
      ? void 0
      : new ReadonlyList<TParams>(privates.names);


    if (options.emitOnObserve === void 0) {
      privates.emitOnObserve = 'none';
    } else if (['always', 'changes', 'none'].includes(options.emitOnObserve)) {
      privates.emitOnObserve = options.emitOnObserve;
    } else {
      throw new TypeError(`Expected void, 'always', 'changes' or 'none' as options.emitOnObserve`);
    }

    privates.timer = null;
    privates.url = new URL(window.location.href);
    privates.navigationObserver = navigation.addListener('navigate', () => {
      QueryParamsObservableUpdate<TParams>(instance);
    });
    privates.updating = false;
  } else {
    throw new TypeError(`Expected void or object as options`);
  }

}

export function IsQueryParamsObservable(value: any): value is IQueryParamsObservable<any> {
  return IsObject(value)
    && value.hasOwnProperty(QUERY_PARAMS_OBSERVABLE_PRIVATE as symbol);
}

/**
 * Checks if any of the query params in current url changed,
 * if yes, emits the changes
 */
export function QueryParamsObservableUpdate<TParams extends string>(
  instance: IQueryParamsObservable<TParams>
): void {
  const privates: IQueryParamsObservablePrivate<TParams> = (instance as IQueryParamsObservableInternal<TParams>)[QUERY_PARAMS_OBSERVABLE_PRIVATE];
  if (!privates.updating) {
    privates.updating = true;
    const url: URL = new URL(window.location.href);
    if (QueryParamChanged(url, privates.url, privates.names)) {
      privates.context.emit(GetQueryParamChanges(url, privates.url, privates.names));
      privates.url = url;
    }
    privates.updating = false;
  }
}
