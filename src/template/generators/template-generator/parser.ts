import { ITemplateGenerator } from './interfaces';
import { TemplateGenerator } from './implementation';
import { IModule } from '../../module/interfaces';
import { parseChildNodes } from '../element-node-generator/parser';


export function parseTemplate(template: string, module: IModule): ITemplateGenerator {
  const container: HTMLElement = document.createElement('div');
  container.innerHTML = template;
  return new TemplateGenerator(parseChildNodes(container, module));
}

