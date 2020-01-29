import { IPathMatcher } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { IPathMatcherInternal, IPathMatcherPrivate, PATH_MATCHER_PRIVATE } from './privates';
import { IParsedURLPath, NormalizeURLPath, ParseURLPath } from './functions';
import { IsObject } from '../../../misc/helpers/is/IsObject';

/** CONSTRUCTOR **/

export function ConstructPathMatcher(
  instance: IPathMatcher,
  path: string
): void {
  ConstructClassWithPrivateMembers(instance, PATH_MATCHER_PRIVATE);
  const privates: IPathMatcherPrivate = (instance as IPathMatcherInternal)[PATH_MATCHER_PRIVATE];
  privates.path = NormalizeURLPath(path);
  const parsedPath: IParsedURLPath = ParseURLPath(privates.path);
  privates.regExp = parsedPath.regExp;
  privates.params = parsedPath.params;
}

export function IsPathMatcher(value: any): value is IPathMatcher {
  return IsObject(value)
    && value.hasOwnProperty(PATH_MATCHER_PRIVATE as symbol);
}
