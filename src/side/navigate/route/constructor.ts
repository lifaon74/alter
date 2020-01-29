import { IRoute } from './interfaces';
import { InferChildRoute, IRouteOptions, TRouteExecGeneric } from './types';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IRouteInternal, IRoutePrivate, ROUTE_PRIVATE } from './privates';
import { PathMatcher } from '../path-matcher/implementation';
import { ReadonlyList } from '@lifaon/observables';
import { IsObject } from '../../../misc/helpers/is/IsObject';

/** CONSTRUCTOR **/

export function ConstructRoute<TExec extends TRouteExecGeneric>(
  instance: IRoute<TExec>,
  path: string,
  options: IRouteOptions<TExec> = {},
): void {
  ConstructClassWithPrivateMembers(instance, ROUTE_PRIVATE);
  const privates: IRoutePrivate<TExec> = (instance as IRouteInternal<TExec>)[ROUTE_PRIVATE];

  if (IsObject(options)) {
    if (typeof path === 'string') {
      privates.pathMatcher = new PathMatcher(path);
    } else {
      throw new TypeError(`Expected string as path`);
    }

    if (options.children === void 0) {
      privates.children = new ReadonlyList<InferChildRoute<TExec>>([]);
    } else if (Symbol.iterator in options.children) {
      const children: InferChildRoute<TExec>[] = Array.from(options.children);
      for (let i = 0, l = children.length; i < l; i++) {
        if (!IsRoute(children[i])) {
          throw new TypeError(`Expected Route at index #${ i } of options.children`);
        }
      }
      privates.children = new ReadonlyList<InferChildRoute<TExec>>(children);
    } else {
      throw new TypeError(`Expected array as options.children`);
    }

    if (options.resolve === void 0) {
      privates.resolve = null;
    } else if (typeof options.resolve === 'function') {
      privates.resolve = options.resolve;
    } else {
      throw new TypeError(`Expected void or function as options.resolve`);
    }

    if (options.exec === void 0) {
      privates.exec = null;
    } else if (typeof options.exec === 'function') {
      privates.exec = options.exec;
    } else {
      throw new TypeError(`Expected void or function as options.exec`);
    }

    if (options.execMode === void 0) {
      privates.execMode = (privates.exec === null) ? null : 'final';
    } else if (privates.exec === null) {
      throw new TypeError(`Expected void as options.execMode if options.exec is undefined`);
    } else if (['partial', 'final'].includes(options.execMode)) {
      privates.execMode = options.execMode;
    } else {
      throw new TypeError(`Expected void, 'partial' or 'final' as options.execMode`);
    }

    if (options.execParamsMode === void 0) {
      privates.execParamsMode = (privates.exec === null) ? null : 'parents';
    } else if (privates.exec === null) {
      throw new TypeError(`Expected void as options.execParamsMode if options.exec is undefined`);
    } else if (['own', 'parents'].includes(options.execParamsMode)) {
      privates.execParamsMode = options.execParamsMode;
    } else {
      throw new TypeError(`Expected void, 'own' or 'parents' as options.execParamsMode`);
    }
  } else {
    throw new TypeError(`Expected void or object as options`);
  }
}

export function IsRoute(value: any): value is IRoute<any> {
  return IsObject(value)
    && value.hasOwnProperty(ROUTE_PRIVATE as symbol);
}
