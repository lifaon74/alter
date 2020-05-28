import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../../core/template/helpers';
import { TNativePromiseLikeOrValue } from '@lifaon/observables';
import { TTemplateRequireFunction } from '../../../../core/template/interfaces';
import { $translate } from '../../../../side/localization/translate/pipes';

export const DESKTOP_CONSTANTS_TO_IMPORT = new Map<string, () => TNativePromiseLikeOrValue<any>>([
  ['$translate', () => $translate],
]);

export const DESKTOP_REQUIRE: TTemplateRequireFunction = (name: string): Promise<any> => {
  return new Promise<any>((resolve: any, reject: any) => {
    if (DESKTOP_CONSTANTS_TO_IMPORT.has(name)) {
      resolve((DESKTOP_CONSTANTS_TO_IMPORT.get(name) as () => TNativePromiseLikeOrValue<any>)());
    } else {
      reject(new Error(`Missing constant '${ name }'`));
    }
  });
};

export const DESKTOP_TEMPLATE_BUILD_OPTIONS = DEFAULT_TEMPLATE_BUILD_OPTIONS.merge({
  require: DESKTOP_REQUIRE,
  constantsToImport: DESKTOP_CONSTANTS_TO_IMPORT.keys(),
});
