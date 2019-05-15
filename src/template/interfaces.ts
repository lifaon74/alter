import { IParsers } from './generators/interfaces';

export interface ITemplateConstructor {
  new(generate: TTemplateFunction): ITemplate;
}

export interface ITemplate {
  generate: TTemplateFunction;
  insert(data: TTemplateDataType, parentNode: Node, refNode?: Node | null | 'clear'): Promise<void> ;
}

export interface ITemplateBuildOptions {
  parsers?: IParsers;
  constantsToImport?: Iterable<string>;
  require?: TTemplateRequireFunction;
  dataSourceName?: string;
}

export type TTemplateDataType = { [key: string]: any };
export type TTemplateFunction = (data: TTemplateDataType) => Promise<DocumentFragment>;
export type TTemplateRequireFunction = (name: string) => Promise<any>;
export type TTemplateRawFunction = (require: TTemplateRequireFunction) => Promise<DocumentFragment>;
