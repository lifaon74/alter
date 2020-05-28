import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../../core/template/helpers';
import { TNativePromiseLikeOrValue } from '@lifaon/observables';
import { TTemplateRequireFunction } from '../../../../core/template/interfaces';
import { $translate } from '../../../../side/localization/translate/pipes';

export const TAG_FS_CONSTANTS_TO_IMPORT = new Map<string, () => TNativePromiseLikeOrValue<any>>([
  ['$translate', () => $translate],
]);

export const TAG_FS_REQUIRE: TTemplateRequireFunction = (name: string): Promise<any> => {
  return new Promise<any>((resolve: any, reject: any) => {
    if (TAG_FS_CONSTANTS_TO_IMPORT.has(name)) {
      resolve((TAG_FS_CONSTANTS_TO_IMPORT.get(name) as () => TNativePromiseLikeOrValue<any>)());
    } else {
      reject(new Error(`Missing constant '${ name }'`));
    }
  });
};

export const TAG_FS_TEMPLATE_BUILD_OPTIONS = DEFAULT_TEMPLATE_BUILD_OPTIONS.merge({
  require: TAG_FS_REQUIRE,
  constantsToImport: TAG_FS_CONSTANTS_TO_IMPORT.keys(),
});
