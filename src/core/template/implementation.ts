import { AttachNode, DestroyChildNodes, DetachChildNodes } from '../custom-node/node-state-observable/mutations';
import {
  ITemplate, ITemplateBuildOptionsStrict, TTemplateDataType, TTemplateFunction, TTemplateRawFunction,
  TTemplateRequireFunction
} from './interfaces';
import { parseTemplate } from './generators/template-generator/parser';
import { IsDevToolOpened, RelativeURLPath } from '../helpers';


export function TemplateCodeToTemplateFunction(lines: string[]): TTemplateRawFunction {
  return new Function(
    'require',
    'return (' + lines.join('\n') + ')(require);'
  ) as any;
}

export function TemplateCodeToTemplateDebuggableFunction(lines: string[]): TTemplateRawFunction {
  let fnc: TTemplateRawFunction;
  try {
    fnc = TemplateCodeToTemplateFunction(lines);
  } catch (error) {
    if (lines.length < 50) {
      console.log(lines.join('\n'));
    }

    (navigator as any).clipboard.writeText(lines.join('\n'))
      .then(() => {
        console.warn('generated code copied into clipboard');
      }, () => {
      });

    throw error;
  }
  // console.log(fnc.toString());
  return (require: TTemplateRequireFunction) => {
    return new Promise<DocumentFragment>((resolve: any) => {
      // console.log(fnc);
      resolve(fnc(require));
    })
      .catch((error: any) => {
        if (error.stack) {
          const reg: RegExp = /<anonymous>:(\d+)\:(\d+)/;
          const stack: string[] = error.stack.split('\n').slice(1);
          for (const stackLine of stack) {
            const match: RegExpExecArray | null = reg.exec(stackLine);
            if (match !== null) {
              const line: number = parseInt(match[1], 10) - 1;
              const column: number = parseInt(match[2], 10);
              const lines: string[] = fnc.toString().split('\n');
              console.log(
                `%c Error '${ error.message }' at ${ line + 1 }:${ column }: \n`
                + '%c ' + lines.slice(line - 3, line).join('\n') + '\n'
                + '%c ' + lines[line] + '\n'
                + '%c ' + lines.slice(line + 1, line + 4).join('\n')
                , `color: #f00`, `color: #000`, `color: #f50`, `color: #000`);

              if (IsDevToolOpened()) {
                console.log(`Type 'fnc' to get the 'generate' function`);
              }
              debugger;
              break;
            }
          }
        }
        throw error;
      });
  };
}

export function TemplateStringToTemplateInstance(
  template: string,
  options: ITemplateBuildOptionsStrict,
): ITemplate {
  return new Template((data: TTemplateDataType) => {
    return TemplateCodeToTemplateDebuggableFunction(
      parseTemplate(template, options.parsers).generate(new Set<string>(options.constantsToImport))
    )((name: string) => { // require function
      if (options.dataSourceName.has(name)) {
        return data;
      } else {
        return options.require(name);
      }
    });
  });
}

export function TemplateURLToTemplateInstance(
  url: string,
  options: ITemplateBuildOptionsStrict,
): Promise<ITemplate> {
  return fetch(url)
    .then((response: Response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`Failed to fetch template at '${ url }'`);
      }
    })
    .then((template: string) => {
      return TemplateStringToTemplateInstance(template, options);
    });
}

export function TemplateRelativeURLToTemplateInstance(moduleURL: string, url: string, options: ITemplateBuildOptionsStrict): Promise<ITemplate> {
  return TemplateURLToTemplateInstance(RelativeURLPath(moduleURL, url), options);
}

// export const templateFromString = TemplateStringToTemplateInstance;
// export const templateFromURL = TemplateURLToTemplateInstance;
// export const templateFromRelativeURL = TemplateRelativeURLToTemplateInstance;

export class Template implements ITemplate {

  static fromString(
    template: string,
    options: ITemplateBuildOptionsStrict,
  ): ITemplate {
    return TemplateStringToTemplateInstance(template, options);
  }

  static fromURL(
    url: string,
    options: ITemplateBuildOptionsStrict,
  ): Promise<ITemplate> {
    return TemplateURLToTemplateInstance(url, options);
  }

  static fromRelativeURL(
    moduleURL: string,
    url: string,
    options: ITemplateBuildOptionsStrict,
  ): Promise<ITemplate> {
    return TemplateRelativeURLToTemplateInstance(moduleURL, url, options);
  }


  public readonly generate: TTemplateFunction;

  constructor(generate: TTemplateFunction) {
    this.generate = generate;
  }

  insert(data: TTemplateDataType, parentNode: Node, refNode?: Node | null | 'clear' | 'destroy'): Promise<void> {
    return this.generate(data)
      .then((node: DocumentFragment) => {
        if (refNode === 'clear') {
          DetachChildNodes(parentNode);
          refNode = null;
        } else if (refNode === 'destroy') {
          DestroyChildNodes(parentNode);
          refNode = null;
        }
        AttachNode(node, parentNode, refNode as (Node | null));
      });
  }
}

