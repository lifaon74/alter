import { testCustomNode } from './custom-node/test-custom-node';
import { testTranslatePipe } from './localization/translate/test';
import { testDateFormatPipe } from './localization/date/test';
import { testNumberFormatPipe } from './localization/number/test';
// import { testParser } from './template/test-parser';


export function test() {
  // testParser();
  // testCustomNode();
  // testTranslatePipe();
  testDateFormatPipe();
  // testNumberFormatPipe();
}
