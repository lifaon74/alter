import { AttachNode } from '../../../../core/custom-node/node-state-observable/mutations';
import { AppTemplateSyntaxDebug } from './app-template-syntax-debug.component';

export async function debugAppTemplateSyntaxComponent(): Promise<void> {
  const component = new AppTemplateSyntaxDebug();
  AttachNode(component, document.body);
}
