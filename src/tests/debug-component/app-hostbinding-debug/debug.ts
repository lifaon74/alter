import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { AppHostBindingDebug } from './app-hostbinding-debug.component';

export async function debugAppHostBindingComponent(): Promise<void> {
  const component = new AppHostBindingDebug();
  AttachNode(component, document.body);
}
