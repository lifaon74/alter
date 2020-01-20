import { IParsers } from './generators/interfaces';
import { TPromiseOrValue } from '@lifaon/observables';

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
export type TTemplateRequireFunction = (name: string) => TPromiseOrValue<any>;
export type TTemplateRawFunction = (require: TTemplateRequireFunction) => Promise<DocumentFragment>;

/** INTERFACES **/

export interface ITemplateConstructor {
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

  new(generate: TTemplateFunction): ITemplate;
}

export interface ITemplate {
  generate: TTemplateFunction;

  insert(data: TTemplateDataType, parentNode: Node, refNode?: Node | null | 'clear' | 'destroy'): Promise<void>;
}


