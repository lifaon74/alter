import { testCustomNode } from './debug-custom-node';
import { debugParser } from '../core/template/test-parser';



export async function test() {
  // await testCustomNode();
  await debugParser();
}
