import { HighlightStringPortion } from '../../../misc/helpers/highlight-string-portion';

export class DynamicCSSRuleError extends Error {
  static createMessage(message: string, rule: CSSStyleRule, start: number, end: number): string {
    return message + ', '
      + 'in rule: \n\n'
      + HighlightStringPortion(rule.selectorText, start, end)
      + '\n'
      ;
  }

  constructor(message: string, rule: CSSStyleRule, start: number, end: number) {
    super(DynamicCSSRuleError.createMessage(message, rule, start, end));
  }
}
