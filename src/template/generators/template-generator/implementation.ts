import { CodeGenerator } from '../code-generator/implementation';
import { ITemplateGenerator } from './interfaces';
import { TElementNodeGeneratorChildren } from '../element-node-generator/interfaces';
import { IndentLines, ScopeLines } from '../snipets';


export const defaultConstantsToImport: string[] = [
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
  '$expression',
  '$scope',
];

export function DetectConstantsToImport(lines: string[], constantsToImport: string[] = defaultConstantsToImport): string[] {
  constantsToImport = constantsToImport.slice();
  const _constantsToImport: string[] = [];
  for (let i = 0, l = lines.length; i < l; i++) {
    const line: string = lines[i];
    for (let j = 0; j < constantsToImport.length; j++) {
      if (line.includes(constantsToImport[j])) {
        _constantsToImport.push(constantsToImport[j]);
        constantsToImport.splice(j, 1);
        j--;
      }
    }
  }
  return _constantsToImport;
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

