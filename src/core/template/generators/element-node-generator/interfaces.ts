import { ICodeGenerator, ICodeGeneratorConstructor } from '../code-generator/interfaces';
import { IAttributeGenerator } from './attribute/interfaces';
import { ITextNodeGenerator } from '../text-node-generator/interfaces';

export interface IElementNodeGeneratorConstructor extends ICodeGeneratorConstructor {
  new(name: string): IElementNodeGenerator;
}

export interface IElementNodeGenerator extends ICodeGenerator {
  readonly name: string;
  readonly attributes: IAttributeGenerator[];
  readonly children: TElementNodeGeneratorChildren[];
}

export type TElementNodeGeneratorChildren = IElementNodeGenerator | ITextNodeGenerator;
