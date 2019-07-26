import { AttachNode, DestroyNode, DetachChildNodes, DetachNode } from '../custom-node/node-state-observable/mutations';
import { DynamicTextNode } from '../custom-node/dynamic-node/dynamic-text-node/implementation';
import { DynamicConditionalNode } from '../custom-node/dynamic-node/dynamic-conditional-node/implementation';
import { DynamicForLoopNode } from '../custom-node/dynamic-node/dynamic-for-loop-node/implementation';
import { DynamicAttribute } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-attribute/implementation';
import { DynamicClass } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-class/implementation';
import { DynamicClassList } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-class-list/implementation';
import { DynamicProperty } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-property/implementation';
import { DynamicStyleList } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-style-list/implementation';
import { ITemplate, ITemplateBuildOptions, TTemplateDataType, TTemplateFunction, TTemplateRawFunction, TTemplateRequireFunction } from './interfaces';
import { parseTemplate } from './generators/template-generator/parser';
import { DynamicEventListener } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-event-listener/implementation';
import { ContainerNode } from '../custom-node/container-node/implementation';
import { DynamicStyle } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-style/implementation';
import { IObservable, NotificationsObserver, Source, TPromiseOrValue } from '@lifaon/observables/public';
import { $scope, $expression, $observable, $observer } from '../misc/helpers/observables-snippets';
import { IStyle } from '../style/interfaces';
import { RelativeURLPath } from '../helpers';
import { StyleURLToStyleInstance } from '../style/implementation';
import { Observable } from '@lifaon/observables/public';
import { DefaultParsers } from './generators/default';

// const defaultConstantsToImport = new Map<string, () => TPromiseOrValue<any>>([
//   ['NotificationsObserver', () => NotificationsObserver],
//   ['AttachNode', () => AttachNode],
//   ['DetachNode', () => DetachNode],
//   ['DestroyNode', () => DestroyNode],
//   ['ContainerNode', () => ContainerNode],
//   ['DynamicTextNode', () => DynamicTextNode],
//   ['DynamicConditionalNode', () => DynamicConditionalNode],
//   ['DynamicForLoopNode', () => DynamicForLoopNode],
//   ['DynamicAttribute', () => DynamicAttribute],
//   ['DynamicClass', () => DynamicClass],
//   ['DynamicClassList', () => DynamicClassList],
//   ['DynamicStyle', () => DynamicStyle],
//   ['DynamicStyleList', () => DynamicStyleList],
//   ['DynamicProperty', () => DynamicProperty],
//   ['DynamicEventListener', () => DynamicEventListener],
//   ['$observable', () => $observable],
//   ['$observer', () => $observer],
//   ['$expression', () => $expression],
//   ['$scope', () => $scope],
// ]);

const defaultConstantsToImport = new Map<string, IObservable<any>>([
  ['NotificationsObserver', new Source<any>().emit(NotificationsObserver)],

  ['AttachNode', new Source<any>().emit(AttachNode)],
  ['DetachNode', new Source<any>().emit(DetachNode)],
  ['DestroyNode', new Source<any>().emit(DestroyNode)],

  ['ContainerNode', new Source<any>().emit(ContainerNode)],
  ['DynamicTextNode', new Source<any>().emit(DynamicTextNode)],
  ['DynamicConditionalNode', new Source<any>().emit(DynamicConditionalNode)],
  ['DynamicForLoopNode', new Source<any>().emit(DynamicForLoopNode)],
  ['DynamicAttribute', new Source<any>().emit(DynamicAttribute)],
  ['DynamicClass', new Source<any>().emit(DynamicClass)],
  ['DynamicClassList', new Source<any>().emit(DynamicClassList)],
  ['DynamicStyle', new Source<any>().emit(DynamicStyle)],
  ['DynamicStyleList', new Source<any>().emit(DynamicStyleList)],
  ['DynamicProperty', new Source<any>().emit(DynamicProperty)],
  ['DynamicEventListener', new Source<any>().emit(DynamicEventListener)],

  ['$observable', new Source<any>().emit($observable)],
  ['$observer', new Source<any>().emit($observer)],
  ['$expression', new Source<any>().emit($expression)],
  ['$scope', new Source<any>().emit($scope)],
]);

// const defaultRequire: TTemplateRequireFunction = async (name: string) => {
//   switch (name) {
//     case 'NotificationsObserver':
//       return NotificationsObserver;
//     case 'AttachNode':
//       return AttachNode;
//     case 'DetachNode':
//       return DetachNode;
//     case 'DestroyNode':
//       return DestroyNode;
//     case 'ContainerNode':
//       return ContainerNode;
//     case 'DynamicTextNode':
//       return DynamicTextNode;
//     case 'DynamicConditionalNode':
//       return DynamicConditionalNode;
//     case 'DynamicForLoopNode':
//       return DynamicForLoopNode;
//     case 'DynamicAttribute':
//       return DynamicAttribute;
//     case 'DynamicClass':
//       return DynamicClass;
//     case 'DynamicClassList':
//       return DynamicClassList;
//     case 'DynamicStyle':
//       return DynamicStyle;
//     case 'DynamicStyleList':
//       return DynamicStyleList;
//     case 'DynamicProperty':
//       return DynamicProperty;
//     case 'DynamicEventListener':
//       return DynamicEventListener;
//     case '$observable':
//       return $observable;
//     case '$observer':
//       return $observer;
//     case '$expression':
//       return $expression;
//     case '$scope':
//       return $scope;
//     // case '$translate':
//     //   return $translate;
//     default:
//       throw new Error(`Cannot find constant '${name}'.`);
//   }
// };

export function NormalizeTemplateBuildOptions(options: ITemplateBuildOptions): ITemplateBuildOptions {
  const _options: ITemplateBuildOptions = {};

  if (options.parsers === void 0) {
    _options.parsers = DefaultParsers;
  } else if ((typeof options.parsers === 'object') && (options.parsers !== null)) {
    _options.parsers = options.parsers;
  } else {
    throw new TypeError(`Expected object as options.parsers`);
  }

  _options.dataSourceName = (options.dataSourceName === void 0)
    ? 'data'
    : options.dataSourceName;

  _options.constantsToImport = (options.constantsToImport === void 0)
    ? [_options.dataSourceName]
    : options.constantsToImport;

  _options.require = (options.require === void 0)
    ? (name: string): Promise<any> => {
      return new Promise<any>((resolve: any, reject: any) => {
        if (defaultConstantsToImport.has(name)) {

        }
      });
    }
    : options.require;

  return _options;
}


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
    }, () => {});

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
                `%c Error '${error.message}' at ${line + 1}:${column}: \n`
                + '%c ' +  lines.slice(line - 3, line).join('\n') + '\n'
                + '%c ' + lines[line] + '\n'
                + '%c ' +  lines.slice(line + 1, line + 4).join('\n')
                , `color: #f00`, `color: #000`, `color: #f50`, `color: #000`);

              const devtools = /./;
              (devtools as any).toString = function() {
                this.opened = true;
              };

              console.log('%c', devtools);
              if ((devtools as any).opened) {
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
  options: ITemplateBuildOptions = {},
): ITemplate {
  options = NormalizeTemplateBuildOptions(options);
  return new Template((data: TTemplateDataType) => {
      return TemplateCodeToTemplateDebuggableFunction(
        parseTemplate(template, options.parsers).generate(new Set<string>(options.constantsToImport))
      )((name: string) => { // require function
        if (name === options.dataSourceName) {
          return Promise.resolve(data);
        } else {
          return options.require(name);
        }
      });
    }
  );
}

export function TemplateURLToTemplateInstance(
  url: string,
  options: ITemplateBuildOptions = {},
): Promise<ITemplate> {
  return fetch(url)
    .then((response: Response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`Failed to fetch template at '${url}'`);
      }
    })
    .then((template: string) =>{
      return TemplateStringToTemplateInstance(template, options);
    });
}

export function TemplateRelativeURLToTemplateInstance(moduleURL: string, url: string, options?: ITemplateBuildOptions): Promise<ITemplate> {
  return TemplateURLToTemplateInstance(RelativeURLPath(moduleURL, url), options);
}

export const templateFromString = TemplateStringToTemplateInstance;
export const templateFromURL = TemplateURLToTemplateInstance;
export const templateFromRelativeURL = TemplateRelativeURLToTemplateInstance;

export class Template implements ITemplate {

  public readonly generate: TTemplateFunction;

  constructor(generate: TTemplateFunction) {
    this.generate = generate;
  }

  insert(data: TTemplateDataType, parentNode: Node, refNode?: Node | null | 'clear'): Promise<void> {
    return this.generate(data)
      .then((node: DocumentFragment) => {
        if (refNode === 'clear') {
          DetachChildNodes(parentNode);
          refNode = null;
        }
        AttachNode(node, parentNode, refNode as (Node | null));
      });
  }
}

