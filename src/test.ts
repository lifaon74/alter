import { testCustomNode } from './custom-node/test-custom-node';
import { testTranslatePipe } from './localization/translate/test';
import { testDateFormatPipe } from './localization/date/test';
import { testNumberFormatPipe } from './localization/number/test';
import { testComponent } from './component/test-component';
import { testSourceProxy } from './source-proxy/SourceProxy';
// import { testParser } from './template/test-parser';


export function test() {
  // testParser();
  // testCustomNode();
  // testTranslatePipe();
  // testDateFormatPipe();
  // testNumberFormatPipe();
  // testComponent();
  testSourceProxy();
}
