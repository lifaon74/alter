import {
  CreateTemplateRequireFunctionFromMap, DEFAULT_TEMPLATE_BUILD_OPTIONS
} from '../../../../core/template/helpers';
import { TNativePromiseLikeOrValue } from '@lifaon/observables';
import { TTemplateRequireFunction } from '../../../../core/template/interfaces';
import { $translate } from '../../../../side/localization/translate/pipes';

export const DESKTOP_CONSTANTS_TO_IMPORT = new Map<string, () => TNativePromiseLikeOrValue<any>>([
  ['$translate', () => $translate],
]);

export const DESKTOP_REQUIRE: TTemplateRequireFunction = CreateTemplateRequireFunctionFromMap(DESKTOP_CONSTANTS_TO_IMPORT);

export const DESKTOP_TEMPLATE_BUILD_OPTIONS = DEFAULT_TEMPLATE_BUILD_OPTIONS.merge({
  require: DESKTOP_REQUIRE,
  constantsToImport: DESKTOP_CONSTANTS_TO_IMPORT.keys(),
});
