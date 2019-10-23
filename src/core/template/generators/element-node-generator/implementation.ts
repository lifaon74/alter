import { CodeGenerator } from '../code-generator/implementation';
import { IElementNodeGenerator, TElementNodeGeneratorChildren } from './interfaces';
import { IAttributeGenerator } from './attribute/interfaces';
import { StaticAttributeGenerator } from './attribute/static/implementation';
import { BindPropertyGenerator } from './attribute/bind/property/implementation';
import { BindDirectiveGenerator } from './attribute/bind/directives/implementation';
import { ScopeLines } from '../snipets';
import { CommandGenerator, IsCommandGenerator } from './attribute/commands/implementation';
import { ICommandGenerator } from './attribute/commands/interfaces';
import { EventListenerGenerator } from './attribute/event/implementation';

export class ElementNodeGenerator extends CodeGenerator implements IElementNodeGenerator {

  public readonly name: string;
  public readonly attributes: IAttributeGenerator[];
  public readonly children: TElementNodeGeneratorChildren[];

  constructor(name: string) {
    super();
    this.name = name;
    this.attributes = [];
    this.children = [];
  }

  generate(): string[] {
    return [
      ...this.generateBindCommands([
        (this.name === 'container')
          ? `const node = new ContainerNode();`
          : `const node = document.createElement(${JSON.stringify(this.name)});`,

        ...this.generateStaticAttributes(),
        ...this.generateBindProperties(),
        ...this.generateBindDirectives(),
        ...this.generateEventListeners(),

        ...this.generateChildNodes(),
      ]),
      `AttachNode(node, parentNode);`
    ];
  }

  generateStaticAttributes(): string[] {
    const lines: string[] = [];
    let attribute: IAttributeGenerator;
    for (let i = 0, l = this.attributes.length; i < l; i++) {
      attribute = this.attributes[i];
      if (attribute instanceof StaticAttributeGenerator) {
        lines.push(...attribute.generate());
      }
    }
    return lines;
  }

  generateBindProperties(): string[] {
    const lines: string[] = [];
    let attribute: IAttributeGenerator;
    for (let i = 0, l = this.attributes.length; i < l; i++) {
      attribute = this.attributes[i];
      if (attribute instanceof BindPropertyGenerator) {
        lines.push(...attribute.generate());
      }
    }
    return lines;
  }

  generateBindDirectives(): string[] {
    const lines: string[] = [];
    let attribute: IAttributeGenerator;
    for (let i = 0, l = this.attributes.length; i < l; i++) {
      attribute = this.attributes[i];
      if (attribute instanceof BindDirectiveGenerator) {
        lines.push(...attribute.generate());
      }
    }
    return lines;
  }

  generateEventListeners(): string[] {
    const lines: string[] = [];
    let attribute: IAttributeGenerator;
    for (let i = 0, l = this.attributes.length; i < l; i++) {
      attribute = this.attributes[i];
      if (attribute instanceof EventListenerGenerator) {
        lines.push(...attribute.generate());
      }
    }
    return lines;
  }

  generateChildNodes(): string[] {
    return (this.children.length === 0) ? [] : ScopeLines([
      `// child nodes`,
      `const parentNode = node;`,

      ...this.children.reduce((lines: string[], child) => {
        lines.push(...ScopeLines(child.generate()));
        return lines;
      }, [])
    ]);
  }


  generateBindCommands(lines: string[]): string[] {
    this.attributes
      .filter<ICommandGenerator>(IsCommandGenerator)
      .sort((a: ICommandGenerator, b: ICommandGenerator) => (b.priority -  a.priority))
      .forEach((attribute: ICommandGenerator) => {
        lines = attribute.generate({ createNode: lines });
      });
    return lines;
  }
}

