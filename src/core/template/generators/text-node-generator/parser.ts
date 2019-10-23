import { ITextNodeGenerator, TTextNodeGeneratorModifiers } from './interfaces';
import { StaticTextNodeGenerator } from './static/implementation';
import { DynamicTextNodeGenerator } from './dynamic/implementation';

/**
 * Syntax: 'abc {{ dynamic }} def'
 */

const inTextExpressionPattern: string = '{{({?.*?}?)}}';
const inTextExpressionRegExp: RegExp = new RegExp(inTextExpressionPattern, 'g');

export function parseText(input: string): ITextNodeGenerator[] {
  const generators: ITextNodeGenerator[] = [];

  inTextExpressionRegExp.lastIndex = 0;
  let match: RegExpExecArray | null;
  let index: number = 0;
  while ((match = inTextExpressionRegExp.exec(input)) !== null) {
    if (index !== match.index) {
      generators.push(new StaticTextNodeGenerator(input.substring(index, match.index)));
    }

    const modifiers: Set<TTextNodeGeneratorModifiers> = new Set<TTextNodeGeneratorModifiers>();

    let value: string = match[1];

    if (value.startsWith('{') && value.endsWith('}')) {
      modifiers.add('expression');
      value = value.slice(1, -1);
    }

    generators.push(new DynamicTextNodeGenerator(value.trim(), modifiers));
    index = match.index + match[0].length;
  }

  if (index !== input.length) {
    generators.push(new StaticTextNodeGenerator(input.substring(index)));
  }

  return generators;
}
