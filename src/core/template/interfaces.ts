import { IParsers } from './generators/interfaces';
import { TNativePromiseLikeOrValue } from '@lifaon/observables';

/** TYPES **/

export interface ITemplateBuildOptions {
  parsers?: IParsers;
  constantsToImport?: Iterable<string>;
  require?: TTemplateRequireFunction;
  dataSourceName?: Iterable<string> | string;
}

export interface INormalizedTemplateBuildOptions extends ITemplateBuildOptions {
  parsers: IParsers;
  constantsToImport: Set<string>;
  require: TTemplateRequireFunction;
  dataSourceName: Set<string>;
}

export type TTemplateDataType = { [key: string]: any };
export type TTemplateFunction = (data: TTemplateDataType) => Promise<DocumentFragment>;
export type TTemplateRequireFunction = (name: string) => TNativePromiseLikeOrValue<any>;
export type TTemplateRawFunction = (require: TTemplateRequireFunction) => Promise<DocumentFragment>;
export type TTemplateRequireFunctionMap = Map<string, () => TNativePromiseLikeOrValue<any>>;

/** INTERFACES **/

export interface ITemplateStatic {
  fromString(
    template: string,
    options: INormalizedTemplateBuildOptions,
  ): ITemplate;

  fromURL(
    url: string,
    options: INormalizedTemplateBuildOptions,
  ): Promise<ITemplate>;

  fromRelativeURL(
    moduleURL: string,
    path: string,
    options: INormalizedTemplateBuildOptions,
  ): Promise<ITemplate>;
}

export interface ITemplateConstructor extends ITemplateStatic {
  new(generate: TTemplateFunction): ITemplate;
}

export interface ITemplate {
  generate: TTemplateFunction;

  insert(data: TTemplateDataType, parentNode: Node, refNode?: Node | null | 'clear' | 'destroy'): Promise<void>;
}


