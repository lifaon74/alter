import { IComponentRoute} from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { COMPONENT_ROUTE_PRIVATE, IComponentRouteInternal, IComponentRoutePrivate } from './privates';
import { IsHTMLElementConstructor } from '../../../core/custom-node/helpers/NodeHelpers';
import { HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP } from '../../../core/component/helpers/elements-list';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { IComponentRouteExecReturn, IComponentRouteOptions } from './types';

/** CONSTRUCTOR **/

export function ConstructComponentRoute(
  instance: IComponentRoute,
  path: string,
  options: IComponentRouteOptions,
): void {
  ConstructClassWithPrivateMembers(instance, COMPONENT_ROUTE_PRIVATE);
  const privates: IComponentRoutePrivate = (instance as IComponentRouteInternal)[COMPONENT_ROUTE_PRIVATE];

  if (typeof options.component === 'string') {
    privates.component = options.component;
  } else if (IsHTMLElementConstructor(options.component)) {
    if (HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP.has(options.component)) {
      privates.component = (HTML_ELEMENT_CONSTRUCTORS_TO_TAG_NAMES_MAP.get(options.component) as Set<string>)[Symbol.iterator]().next().value;
    } else {
      throw new Error(`The provided HTMLElement's constructor is not registered`);
    }
  } else {
    throw new TypeError(`Expected string or HTMLElementConstructor as options.component`);
  }

  if (options.routerId === void 0) {
    privates.routerId = null;
  } else if (typeof options.routerId === 'string') {
    privates.routerId = options.routerId;
  } else {
    throw new TypeError(`Expected void or string as options.routerId`);
  }

  privates.pendingExec = Promise.resolve<IComponentRouteExecReturn>({
    parentElement: null,
  });
  privates.pendingExecAbortController = null;
}

export function IsComponentRoute(value: any): value is IComponentRoute {
  return IsObject(value)
    && value.hasOwnProperty(COMPONENT_ROUTE_PRIVATE as symbol);
}
