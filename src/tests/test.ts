import { debugCustomNode } from './debug-custom-node';
import { debugParser } from './debug-parser';
import { debugDynamicCssRule } from './debug-dynamic-css-rule';



export async function test() {
  // await testCustomNode();
  // await debugParser();
  await debugDynamicCssRule();
}
