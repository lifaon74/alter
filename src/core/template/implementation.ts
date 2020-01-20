import { AttachNode, DestroyChildNodes, DetachChildNodes } from '../custom-node/node-state-observable/mutations';
import {
  ITemplate, INormalizedTemplateBuildOptions, TTemplateDataType, TTemplateFunction, TTemplateRawFunction,
  TTemplateRequireFunction
} from './interfaces';
import { parseTemplate } from './generators/template-generator/parser';
import { IsDevToolOpened } from '../../misc/helpers/IsDevToolOpened';
import { RelativeURLPath } from '../../misc/helpers/RelativeURLPath';


/**
 * Converts some lines of code to a "template" function
 */
export function TemplateCodeToTemplateFunction(lines: string[]): TTemplateRawFunction {
  return new Function(
    'require',
    'return (' + lines.join('\n') + ')(require);'
  ) as any;
}


/**
 * Displays properly the code where the error append, and puts a breakpoint if the debugger is activated
 */
export function DebugTemplateFunctionError(error: Error, fnc: TTemplateRawFunction): void {
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
}


/**
 * Converts some lines of code to a "template" function
 *  - ensure than the execution of the function works properly and returns a promise, else displays an error message
 */
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
        DebugTemplateFunctionError(error, fnc);
        throw error;
      });
  };
}


/**
 * Parses and converts a template string into a Template instance
 */
export function TemplateStringToTemplateInstance(
  template: string,
  options: INormalizedTemplateBuildOptions,
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

/**
 * Parses and converts a template string fetched from 'url' into a Template instance
 */
export function TemplateURLToTemplateInstance(
  url: string,
  options: INormalizedTemplateBuildOptions,
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

/**
 * Parses and converts a template string fetched from an url, built from the current module's url and a relative path, into a Template instance
 */
export function TemplateRelativeURLToTemplateInstance(moduleURL: string, path: string, options: INormalizedTemplateBuildOptions): Promise<ITemplate> {
  return TemplateURLToTemplateInstance(RelativeURLPath(moduleURL, path).href, options);
}


export class Template implements ITemplate {

  static fromString(
    template: string,
    options: INormalizedTemplateBuildOptions,
  ): ITemplate {
    return TemplateStringToTemplateInstance(template, options);
  }

  static fromURL(
    url: string,
    options: INormalizedTemplateBuildOptions,
  ): Promise<ITemplate> {
    return TemplateURLToTemplateInstance(url, options);
  }

  static fromRelativeURL(
    moduleURL: string,
    path: string,
    options: INormalizedTemplateBuildOptions,
  ): Promise<ITemplate> {
    return TemplateRelativeURLToTemplateInstance(moduleURL, path, options);
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

