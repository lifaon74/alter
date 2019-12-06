import { AttachNode, DestroyNode, DetachNode } from '../../../../core/custom-node/node-state-observable/mutations';
import { AppLifeCycleDebug } from './app-life-cycle-debug.component';
import { $delay } from '@lifaon/observables';

export async function debugAppLifeCycleComponent(): Promise<void> {
  const component = new AppLifeCycleDebug();
  console.log('expected onCreate');

  await $delay(100);
  console.log('expected onInit');

  const container = document.createElement('div');

  AttachNode(component, container);
  console.log('expected nothing');

  await $delay(100);
  AttachNode(container, document.body);
  console.log('expected onConnect');

  await $delay(100);
  DetachNode(component);
  console.log('expected onDisconnect');

  await $delay(100);
  DestroyNode(component);
  console.log('expected onDestroy');
}
