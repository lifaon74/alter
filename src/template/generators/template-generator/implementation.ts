import { CodeGenerator } from '../code-generator/implementation';
import { ITemplateGenerator } from './interfaces';
import { TElementNodeGeneratorChildren } from '../element-node-generator/interfaces';
import { IndentLines, ScopeLines } from '../snipets';


export const defaultConstantsToImport = [
  'NotificationsObserver',
  'AttachNode',
  'DetachNode',
  'DestroyNode',
  'ContainerNode',
  'DynamicTextNode',
  'DynamicConditionalNode',
  'DynamicForLoopNode',
  'DynamicAttribute',
  'DynamicClass',
  'DynamicClassList',
  'DynamicStyle',
  'DynamicStyleList',
  'DynamicProperty',
  'DynamicEventListener',

  '$observable',
  '$observer',
  '$expression',
  '$scope',
] as const;

export type TDefaultConstantsToImport = typeof defaultConstantsToImport[keyof typeof defaultConstantsToImport];

export function DetectConstantsToImport(lines: string[], potentialConstantsToImport: Iterable<string> = defaultConstantsToImport): string[] {
  const remainingConstantsToImport: string[] = Array.from(potentialConstantsToImport);
  const constantsToImport: string[] = [];
  for (let i = 0, l = lines.length; i < l; i++) {
    const line: string = lines[i];
    for (let j = 0; j < remainingConstantsToImport.length; j++) {
      if (line.includes(remainingConstantsToImport[j])) {
        constantsToImport.push(remainingConstantsToImport[j]);
        remainingConstantsToImport.splice(j, 1);
        j--;
      }
    }
  }
  return constantsToImport;
}

export function GenerateConstantsToImport(constantsToImport: string[]): string[] {
  return [
    `const [`,
    ...IndentLines(constantsToImport.map(_ => (_ + ','))),
    `] = await Promise.all([`,
    ...IndentLines(constantsToImport.map(_ => `require(${JSON.stringify(_)}),`)),
    `]);`,
  ]
}

export class TemplateGenerator extends CodeGenerator implements ITemplateGenerator {
  public readonly children: TElementNodeGeneratorChildren[];

  constructor(children: TElementNodeGeneratorChildren[]) {
    super();
    this.children = children;
  }

  generate(constantsToImport: string[] = [], detectConstantsToImport: boolean = true): string[] {
    const lines: string[] = this.generateChildNodes();
    if (detectConstantsToImport) {
      constantsToImport = Array.from(new Set<string>(constantsToImport.concat(DetectConstantsToImport(lines))));
    }
    return [
      `async (require) => {`,
      ...IndentLines([
        ...GenerateConstantsToImport(constantsToImport),
        `const parentNode = document.createDocumentFragment();`,
        ...lines,
        `return parentNode;`,
      ]),
      `}`,
    ];
  }

  generateChildNodes(): string [] {
    return this.children.reduce((lines: string[], child) => {
      lines.push(...ScopeLines(child.generate()));
      return lines;
    }, []);
  }
}


// export class HostTemplateGenerator extends CodeGenerator implements ITemplateGenerator {
//   public readonly generator: ICodeGenerator;
//
//   constructor(generator: ICodeGenerator) {
//     super();
//     this.generator = generator;
//   }
//
//   generate(constantsToImport: string[] = [], detectConstantsToImport: boolean = true): string[] {
//     const lines: string[] = ScopeLines(this.generator.generate());
//     if (detectConstantsToImport) {
//       constantsToImport = Array.from(new Set<string>(constantsToImport.concat(DetectConstantsToImport(lines))));
//     }
//     return [
//       `async (require) => {`,
//       ...IndentLines([
//         ...GenerateConstantsToImport(constantsToImport),
//         ...lines,
//         `return node;`,
//       ]),
//       `}`,
//     ];
//   }
// }

