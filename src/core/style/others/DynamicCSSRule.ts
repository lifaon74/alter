import { IterableQuerySelector } from '../../custom-node/helpers/NodeHelpers';
import { DynamicCSSRuleToken, ParseDynamicCSSRule } from './tokenizer';
import { uuid } from '../../../misc/helpers/uuid';

export type TDynamicCSSCallback = (element: HTMLElement, name: string, args: any) => (boolean | void);

export class DynamicCSS {
  public readonly rules: DynamicCSSRule[];

  constructor(styleElement: HTMLStyleElement) {
    this.rules = [];
    const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
    for (let i = 0, l = sheet.cssRules.length; i < l; i++) {
      const cssRule: CSSRule = sheet.cssRules[i];
      switch (cssRule.type) {
        case CSSRule.STYLE_RULE:
          const rule: DynamicCSSRule | null = ExtractDynamicCSSRule(cssRule as CSSStyleRule, i);
          if (rule !== null) {
            this.rules.push(rule);
          }
          break;
      }
    }
  }

  update(callback: TDynamicCSSCallback): void {
    for (let i = 0, l = this.rules.length; i < l; i++) {
      this.rules [i].update(callback);
    }
  }

  clear(): void {
    for (let i = 0, l = this.rules.length; i < l; i++) {
      this.rules [i].clear();
    }
  }
}


export function ExtractDynamicCSSRule(cssRule: CSSStyleRule, ruleIndex: number): DynamicCSSRule | null {
  const ruleTokens: DynamicCSSRuleToken[] = ParseDynamicCSSRule(cssRule);
  return (ruleTokens.length === 0)
    ? null
    : new DynamicCSSRule(cssRule, ruleIndex,ruleTokens );
}

function GenerateNoCSSRuleTokenSelector(
  ruleTokens: DynamicCSSRuleToken[],
  cssRule: CSSStyleRule = ruleTokens[0].range.rule
): string {
  let index: number = 0;
  let selector: string = '';
  for (let i = 0, l = ruleTokens.length; i < l; i++) {
    const _ruleToken: DynamicCSSRuleToken = ruleTokens[i];
    selector += cssRule.selectorText.slice(index, _ruleToken.range.start);
    index = _ruleToken.range.end;
  }
  return selector + cssRule.selectorText.slice(index);
}

function GenerateCompleteCSSRuleTokenSelector(
  ruleTokens: DynamicCSSRuleToken[],
  ids: string[],
  cssRule: CSSStyleRule = ruleTokens[0].range.rule
): string {
  let index: number = 0;
  let selector: string = '';
  for (let i = 0, l = ruleTokens.length; i < l; i++) {
    const _ruleToken: DynamicCSSRuleToken = ruleTokens[i];
    selector += cssRule.selectorText.slice(index, _ruleToken.range.start) + '[' + ids[i] + ']';
    index = _ruleToken.range.end;
  }
  return selector + cssRule.selectorText.slice(index);
}

function GenerateSingleCSSRuleTokenSelector(
  ruleToken: DynamicCSSRuleToken,
  ruleTokens: DynamicCSSRuleToken[],
  id: string,
  cssRule: CSSStyleRule = ruleTokens[0].range.rule
): string {
  let index: number = 0;
  let selector: string = '';
  for (let i = 0, l = ruleTokens.length; i < l; i++) {
    const _ruleToken: DynamicCSSRuleToken = ruleTokens[i];

    selector += cssRule.selectorText.slice(index, _ruleToken.range.start);
    if (_ruleToken === ruleToken) {
      selector += '[' + id + ']';
    }

    index = _ruleToken.range.end;
  }
  return selector + cssRule.selectorText.slice(index);
}


export class DynamicCSSRule {

  private readonly _ruleTokens: DynamicCSSRuleToken[];

  private readonly _ids: string[];
  private readonly _tmpIds: string[];

  private readonly _baseSelector: string;
  private readonly _completeSelector: string;
  private readonly _perRuleSelector: string[];

  private _elementsToIdsMap: Map<HTMLElement, Set<string>>;

  constructor(cssRule: CSSStyleRule, ruleIndex: number, ruleTokens: DynamicCSSRuleToken[]) {
    this._ruleTokens = ruleTokens;

    this._ids = ruleTokens.map(() => 'rule-' + uuid());
    this._tmpIds = ruleTokens.map(() => 'tmp-' + uuid());

    this._baseSelector = GenerateNoCSSRuleTokenSelector(ruleTokens, cssRule);
    this._completeSelector = GenerateCompleteCSSRuleTokenSelector(ruleTokens, this._ids, cssRule);
    this._perRuleSelector = ruleTokens.map((rule: DynamicCSSRuleToken, index: number) => GenerateSingleCSSRuleTokenSelector(rule, ruleTokens, this._tmpIds[index], cssRule));

    this._elementsToIdsMap = new Map<HTMLElement, Set<string>>();

    const declarations: string = cssRule.cssText
      .substring(cssRule.selectorText.length)
      .trim()
      .slice(1, -1)
      .trim();

    const sheet: CSSStyleSheet = cssRule.parentStyleSheet as CSSStyleSheet;
    sheet.deleteRule(ruleIndex);
    sheet.insertRule(`${this._completeSelector} { ${declarations} }`, ruleIndex);
  }

  update(callback: TDynamicCSSCallback): void {
    const elementsToIdsMap: Map<HTMLElement, Set<string>> = new Map<HTMLElement, Set<string>>();

    const iterator: IterableIterator<HTMLElement> = IterableQuerySelector(document.documentElement, this._baseSelector);
    let result: IteratorResult<HTMLElement>;
    while (!(result = iterator.next()).done) {
      const child: HTMLElement = result.value;
      let element: HTMLElement = child;

      // 1) list all rules applying to the DOM tree (from child to top parent)
      const elementRules: [HTMLElement, DynamicCSSRuleToken][] = [];
      while (element) {
        for (let i = 0, l = this._ruleTokens.length; i < l; i++) {
          element.setAttribute(this._tmpIds[i], '');
          if (child.matches(this._perRuleSelector[i])) {
            elementRules.push([element, this._ruleTokens[i]]);
          }
          element.removeAttribute(this._tmpIds[i]);
        }
        element = element.parentElement as HTMLElement;
      }

      // 2) for each rule which applies to an element
      for (let i = 0, l = elementRules.length; i < l; i++) {
        const [element, rule] = elementRules[i];
        const valid: boolean | void = callback(element, rule.name.name, rule.args.args);
        if (valid === false) {
          break;
        } else {
          const id: string = this._ids[i];
          if (!elementsToIdsMap.has(element)) {
            elementsToIdsMap.set(element, new Set<string>());
          }
          elementsToIdsMap.get(element).add(id);
          if (this._elementsToIdsMap.has(element)) {
            const ids: Set<string> = this._elementsToIdsMap.get(element);
            if (ids.has(id)) {
              ids.delete(id);
              if (ids.size === 0) {
                this._elementsToIdsMap.delete(element);
              }
            } else {
              // console.log('set', id);
              element.setAttribute(id, '');
            }
          } else {
            // console.log('set', id);
            element.setAttribute(id, '');
          }
        }
      }
    }

    this.clear();

    this._elementsToIdsMap = elementsToIdsMap;
  }

  clear(): void {
    for (const [element, ids] of this._elementsToIdsMap.entries()) {
      for (const id of ids.values()) {
        // console.log('remove', id);
        element.removeAttribute(id);
      }
    }
  }
}


