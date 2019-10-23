import { ITemplateGenerator } from './interfaces';
import { TemplateGenerator } from './implementation';
import { parseChildNodes } from '../element-node-generator/parser';
import { IParsers } from '../interfaces';


export function parseTemplate(template: string, parsers: IParsers): ITemplateGenerator {
  const container: HTMLElement = document.createElement('div');
  container.innerHTML = template;
  return new TemplateGenerator(parseChildNodes(container, parsers));
}

