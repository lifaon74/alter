import { ITemplateBuildOptions, INormalizedTemplateBuildOptions, TTemplateRequireFunction } from './interfaces';
import { DEFAULT_PARSERS } from './generators/default';
import {
  $add, $and, $divide, $equal, $expression, $max, $min, $multiply, $not, $notEqual, $observable, $observer, $or, $scope,
  $string, $subtract, NotificationsObserver, TPromiseOrValue
} from '@lifaon/observables';
import { AttachNode, DestroyNode, DetachNode } from '../custom-node/node-state-observable/mutations';
import { ContainerNode } from '../custom-node/container-node/implementation';
import { DynamicTextNode } from '../custom-node/dynamic-node/dynamic-text-node/implementation';
import { DynamicConditionalNode } from '../custom-node/dynamic-node/dynamic-conditional-node/implementation';
import { DynamicForLoopNode } from '../custom-node/dynamic-node/dynamic-for-loop-node/implementation';
import { DynamicAttribute } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-attribute/implementation';
import { DynamicClass } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-class/implementation';
import { DynamicClassList } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-class-list/implementation';
import { DynamicStyle } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-style/implementation';
import { DynamicStyleList } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-style-list/implementation';
import { DynamicProperty } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-property/implementation';
import { DynamicEventListener } from '../custom-node/dynamic-node/dynamic-element-node/dynamic-event-listener/implementation';
import { IParsers } from './generators/interfaces';
import { union } from '../../misc/helpers/set-operations';
import { IsObject } from '../../misc/helpers/is/IsObject';

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

// const defaultConstantsToImport = new Map<string, IObservable<any>>([
//   ['NotificationsObserver', new Source<any>().emit(NotificationsObserver)],
//
//   ['AttachNode', new Source<any>().emit(AttachNode)],
//   ['DetachNode', new Source<any>().emit(DetachNode)],
//   ['DestroyNode', new Source<any>().emit(DestroyNode)],
//
//   ['ContainerNode', new Source<any>().emit(ContainerNode)],
//   ['DynamicTextNode', new Source<any>().emit(DynamicTextNode)],
//   ['DynamicConditionalNode', new Source<any>().emit(DynamicConditionalNode)],
//   ['DynamicForLoopNode', new Source<any>().emit(DynamicForLoopNode)],
//   ['DynamicAttribute', new Source<any>().emit(DynamicAttribute)],
//   ['DynamicClass', new Source<any>().emit(DynamicClass)],
//   ['DynamicClassList', new Source<any>().emit(DynamicClassList)],
//   ['DynamicStyle', new Source<any>().emit(DynamicStyle)],
//   ['DynamicStyleList', new Source<any>().emit(DynamicStyleList)],
//   ['DynamicProperty', new Source<any>().emit(DynamicProperty)],
//   ['DynamicEventListener', new Source<any>().emit(DynamicEventListener)],
//
//   ['$observable', new Source<any>().emit($observable)],
//   ['$observer', new Source<any>().emit($observer)],
//   ['$expression', new Source<any>().emit($expression)],
//   ['$scope', new Source<any>().emit($scope)],
// ]);


const DEFAULT_CONSTANTS_TO_IMPORT = new Map<string, () => TPromiseOrValue<any>>([
  ['NotificationsObserver', () => NotificationsObserver],

  ['AttachNode', () => AttachNode],
  ['DetachNode', () => DetachNode],
  ['DestroyNode', () => DestroyNode],

  ['ContainerNode', () => ContainerNode],
  ['DynamicTextNode', () => DynamicTextNode],
  ['DynamicConditionalNode', () => DynamicConditionalNode],
  ['DynamicForLoopNode', () => DynamicForLoopNode],
  ['DynamicAttribute', () => DynamicAttribute],
  ['DynamicClass', () => DynamicClass],
  ['DynamicClassList', () => DynamicClassList],
  ['DynamicStyle', () => DynamicStyle],
  ['DynamicStyleList', () => DynamicStyleList],
  ['DynamicProperty', () => DynamicProperty],
  ['DynamicEventListener', () => DynamicEventListener],

  ['$observable', () => $observable],
  ['$observer', () => $observer],
  ['$expression', () => $expression],
  ['$scope', () => $scope],

  ['$equal', () => $equal],
  ['$notEqual', () => $notEqual],

  ['$add', () => $add],
  ['$subtract', () => $subtract],
  ['$multiply', () => $multiply],
  ['$divide', () => $divide],
  ['$min', () => $min],
  ['$max', () => $max],

  ['$and', () => $and],
  ['$or', () => $or],
  ['$not', () => $not],

  ['$string', () => $string],
]);

const DEFAULT_REQUIRE: TTemplateRequireFunction = (name: string): Promise<any> => {
  return new Promise<any>((resolve: any, reject: any) => {
    if (DEFAULT_CONSTANTS_TO_IMPORT.has(name)) {
      resolve((DEFAULT_CONSTANTS_TO_IMPORT.get(name) as () => TPromiseOrValue<any>)());
    } else {
      reject(new Error(`Missing constant '${ name }'`));
    }
  });
};

export function NormalizeTemplateBuildOptions(options: ITemplateBuildOptions = {}): INormalizedTemplateBuildOptions {
  const _options: INormalizedTemplateBuildOptions = {} as INormalizedTemplateBuildOptions;

  if (options.parsers === void 0) {
    _options.parsers = DEFAULT_PARSERS;
  } else if (IsObject(options.parsers)) {
    _options.parsers = options.parsers;
  } else {
    throw new TypeError(`Expected object as options.parsers`);
  }

  _options.dataSourceName = TemplateBuildOptionsDataSourceNameToSet(options.dataSourceName);
  _options.constantsToImport = union<string>((options.constantsToImport === void 0) ? DEFAULT_CONSTANTS_TO_IMPORT.keys() : options.constantsToImport, _options.dataSourceName);

  _options.require = (options.require === void 0)
    ? DEFAULT_REQUIRE
    : options.require;

  return _options;
}


export function TemplateBuildOptionsDataSourceNameToSet(dataSourceName?: Iterable<string> | string): Set<string> {
  if (dataSourceName === void 0) {
    return new Set<string>(['data']);
  } else if (typeof dataSourceName === 'string') {
    return new Set<string>([dataSourceName]);
  } else if (Symbol.iterator in dataSourceName) {
    return new Set<string>(dataSourceName);
  } else {
    throw new TypeError(`Expected void, string or Iterable<string> as dataSourceName`);
  }
}


export function MergeTemplateBuildOptionsParsers(parsers1: IParsers | undefined, parsers2: IParsers | undefined): IParsers | undefined {
  if (parsers1 === void 0) {
    return parsers2;
  } else if (parsers2 === void 0) {
    return parsers1;
  } else {
    return {
      directives: union(parsers1.directives, parsers2.directives),
      commands: union(parsers1.commands, parsers2.commands),
    };
  }
}

export function MergeTemplateBuildOptionsDataSourceName(dataSourceName1: Iterable<string> | string | undefined, dataSourceName2: Iterable<string> | string | undefined): Iterable<string> | string | undefined {
  if (dataSourceName1 === void 0) {
    return dataSourceName2;
  } else if (dataSourceName2 === void 0) {
    return dataSourceName1;
  } else {
    return union(dataSourceName1, dataSourceName2);
  }
}

export function MergeTemplateBuildOptionsConstantsToImport(constantsToImport1: Iterable<string> | undefined, constantsToImport2: Iterable<string> | undefined): Iterable<string> | undefined {
  if (constantsToImport1 === void 0) {
    return constantsToImport2;
  } else if (constantsToImport2 === void 0) {
    return constantsToImport1;
  } else {
    return union(constantsToImport1, constantsToImport2);
  }
}

export function MergeTemplateBuildOptionsRequire(require1: TTemplateRequireFunction | undefined, require2: TTemplateRequireFunction | undefined): TTemplateRequireFunction | undefined {
  if (require1 === void 0) {
    return require2;
  } else if (require2 === void 0) {
    return require1;
  } else {
    return (name: string): Promise<any> => {
      return new Promise(resolve => resolve(require2(name)))
        .catch(() => {
          return require1(name);
        });
    };
  }
}

export function MergeTemplateBuildOptions(options1: ITemplateBuildOptions | undefined, options2: ITemplateBuildOptions | undefined): ITemplateBuildOptions | undefined {
  if (options1 === void 0) {
    return options2;
  } else if (options2 === void 0) {
    return options1;
  } else {
    return {
      parsers: MergeTemplateBuildOptionsParsers(options1.parsers, options2.parsers),
      dataSourceName: MergeTemplateBuildOptionsDataSourceName(options1.dataSourceName, options2.dataSourceName),
      constantsToImport: MergeTemplateBuildOptionsConstantsToImport(options1.constantsToImport, options2.constantsToImport),
      require: MergeTemplateBuildOptionsRequire(options1.require, options2.require),
    };
  }
}

export class TemplateBuildOptions implements INormalizedTemplateBuildOptions {
  readonly parsers: IParsers;
  readonly constantsToImport: Set<string>;
  readonly require: TTemplateRequireFunction;
  readonly dataSourceName: Set<string>;

  constructor(options?: ITemplateBuildOptions) {
    Object.assign(this, NormalizeTemplateBuildOptions(options));
  }

  merge(options: ITemplateBuildOptions): TemplateBuildOptions {
    return new TemplateBuildOptions(MergeTemplateBuildOptions(this, options));
  }
}

export const DEFAULT_TEMPLATE_BUILD_OPTIONS = new TemplateBuildOptions();
