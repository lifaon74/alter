import { debugCustomNode } from './debug/debug-custom-node';
import { debugParser } from './debug/debug-parser';
import { debugDynamicCssRule } from './debug/debug-dynamic-css-rule';
import { debugComponents } from './debug/debug-component/debug-components';
import { debugDateFormatPipe } from '../side/localization/date/debug';
import { debugNumberFormatPipe } from '../side/localization/number/debug';
import { debugTranslatePipe, debugTranslateService } from '../side/localization/translate/debug';



export async function test() {
  // await testCustomNode();
  // await debugParser();
  // await debugDynamicCssRule();
  // await debugComponents();
  // await debugDateFormatPipe();
  // await debugNumberFormatPipe();
  // await debugTranslateService();
  await debugTranslatePipe();
}
