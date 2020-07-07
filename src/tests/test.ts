import { debugCustomNode } from './debug/debug-custom-node';
import { debugParser } from './debug/debug-parser';
import { debugDynamicCssRule } from './debug/debug-dynamic-css-rule';
import { debugComponents } from './debug/debug-component/debug-components';
import { debugDateFormatPipe } from '../side/localization/date/debug';
import { debugNumberFormatPipe } from '../side/localization/number/debug';
import { debugTranslatePipe, debugTranslateService } from '../side/localization/translate/debug';
import { debugDataProxy } from '../side/data-proxy/data-proxy';
import { debugDataProxy2 } from '../side/data-proxy/data-proxy-2';
import { runApps } from './apps/run-apps';
import { debugRoute } from './debug/debug-router/debug-route';
import { experimentClassBuilder } from './experimental/classes/experimental-class-builder';
import { experimentClass } from './experimental/classes/concept';
import { debugInfiniteScroller } from './apps/infinite-scroller/test';
import { debugQueryParamsChange } from './debug/debug-router/debug-query-params-observable';
import { debugNavigation } from './debug/debug-router/debug-navigation';



export async function test() {
  // await testCustomNode();
  // await debugParser();
  // await debugDynamicCssRule();
  // await debugComponents();
  // await debugDateFormatPipe();
  // await debugNumberFormatPipe();
  // await debugTranslateService();
  // await debugTranslatePipe();
  // await debugDataProxy();
  // await debugDataProxy2();
  await runApps();
  // await debugRoute();
  // await experimentClassBuilder();
  // await experimentClass();
  // await debugInfiniteScroller();
  // await debugQueryParamsChange();
  // await debugNavigation();
}
