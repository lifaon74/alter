import { DynamicCSSRuleError } from './DynamicCSSRuleError';


/**
 * Represents a portion of a CSSStyleRule
 */
export class CSSRuleRange {
  public readonly rule: CSSStyleRule;
  public readonly start: number;
  public readonly end: number;

  constructor(rule: CSSStyleRule, start: number, end: number) {
    this.rule = rule;
    this.start = start;
    this.end = end;
  }

  get value(): string {
    return this.rule.cssText.slice(this.start, this.end)
  }
}

export abstract class CSSRuleToken {
  public readonly range: CSSRuleRange;

  protected constructor(range: CSSRuleRange) {
    this.range = range;
  }
}

export class DynamicCSSRuleNameToken extends CSSRuleToken {
  public readonly name: string;

  constructor(range: CSSRuleRange, name: string = range.rule.cssText.slice(range.start, range.end)) {
    super(range);
    this.name = name;
  }
}

export class DynamicCSSRuleArgsToken<T = any> extends CSSRuleToken {
  public readonly args: T;

  constructor(range: CSSRuleRange, args: T = JSON.parse(range.rule.cssText.slice(range.start, range.end))) {
    super(range);
    this.args = args;
  }
}

export class DynamicCSSRuleDeclarationToken extends CSSRuleToken {
  public readonly declaration: string;

  constructor(range: CSSRuleRange, declaration: string = range.rule.cssText.slice(range.start, range.end)) {
    super(range);
    this.declaration = declaration;
  }
}

export class DynamicCSSRuleToken extends CSSRuleToken {
  public readonly name: DynamicCSSRuleNameToken;
  public readonly args: DynamicCSSRuleArgsToken;

  constructor(range: CSSRuleRange, name: DynamicCSSRuleNameToken, args: DynamicCSSRuleArgsToken) {
    super(range);
    this.name = name;
    this.args = args;
  }
}


/**
 * Syntax:
 *  [--key]
 *  [--key="value"]
 *
 * 'key' must be: [a-z\-]+
 * 'value' must be in JSON format
 */
export function ParseDynamicCSSRule(rule: CSSStyleRule, ruleTokens: DynamicCSSRuleToken[] = []): DynamicCSSRuleToken[] {
  let index: number = 0;
  while (true) {
    // searches for [--
    index = rule.selectorText.indexOf('[--', index);
    if (index === -1) {
      break;
    } else {
      const start: number = index; // keep start index of the rule
      index += 3; // move index after [--

      const reg: RegExp = /^([a-z\-]+?)[\]=]/;
      // searches for a name
      const match: RegExpExecArray | null = reg.exec(rule.selectorText.slice(index));
      if (match === null) {
        throw new DynamicCSSRuleError(`Invalid name: expected /[a-z\\-]+/`, rule, index, index);
      } else {
        const nameToken: DynamicCSSRuleNameToken = new DynamicCSSRuleNameToken(new CSSRuleRange(rule, index, index + match[1].length));
        index = nameToken.range.end; // move index after name

        // extract argument
        let argsToken: DynamicCSSRuleArgsToken;
        [index, argsToken] = ParseDynamicCSSRuleArgument(rule, index);

        const ruleToken: DynamicCSSRuleToken = new DynamicCSSRuleToken(new CSSRuleRange(rule, start, index), nameToken, argsToken);
        ruleTokens.push(ruleToken);
      }
    }
  }

  return ruleTokens;
}

/**
 * structure: ="json"]
 * @example: "{ color: \"blue\" }"
 */
export function ParseDynamicCSSRuleArgument(rule: CSSStyleRule, index: number): [number, DynamicCSSRuleArgsToken] {
  const char: string = rule.selectorText.charAt(index);

  if (char === '=') {
    index++; // move index after =

    // expect a quote
    const quote: string = rule.selectorText.charAt(index);
    if ((quote !== '"') && (quote !== '\'')) {
      throw new DynamicCSSRuleError(`Expect quote ' or "`, rule, index, index);
    }

    let args: string;
    const argsStart: number = index;

    // try to parse arguments as JSON
    while (true) {
      // searches for "]
      index = rule.selectorText.indexOf(quote + ']', index);
      if (index === -1) {
        throw new DynamicCSSRuleError(`Cannot parse argument`, rule, argsStart, argsStart);
      } else { // INFO: the "] may be part of the JSON
        index++; // move index to ]
        try {
          // try to parse JSON. If "] is part of the JSON, it will fail.
          args = JSON.parse(rule.selectorText.slice(argsStart, index));
          index++; // move index after ]
          break;
        } catch (e) { // in case of error, test with next ]
          index++; // move index after ]
        }
      }
    }

    try {
      return [index, new DynamicCSSRuleArgsToken(new CSSRuleRange(rule, argsStart, index), JSON.parse(args))];
    } catch (e) {
      throw new DynamicCSSRuleError(`Cannot parse argument`, rule, argsStart, index);
    }
  } else if (char === ']') {
    index++;
    return [index, new DynamicCSSRuleArgsToken(new CSSRuleRange(rule, index, index), null)];
  } else {
    throw new DynamicCSSRuleError(`Invalid expression for argument: expected = or ]`, rule, index, index);
  }
}


