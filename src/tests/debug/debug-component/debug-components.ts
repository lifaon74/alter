import { AppProgressBar } from './app-progress-bar/progress-bar.component';
import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { debugAppLifeCycleComponent } from './app-life-cycle-debug/debug';
import { debugAppTemplateSyntaxComponent } from './app-template-syntax-debug/debug';
import { debugAppHostBindingComponent } from './app-hostbinding-debug/debug';

export function debugAppProgressBar(): void {
  const progressBar = new AppProgressBar();

  AttachNode(progressBar, document.body);

  setInterval(() => {
    // progressBar.ratio = Math.random();
    progressBar.setAttribute('ratio', Math.random().toString(10));
  }, 1000);
}


export async function debugComponents(): Promise<void> {
  // debugAppProgressBar();
  // await debugAppLifeCycleComponent();
  // await debugAppTemplateSyntaxComponent();
  await debugAppHostBindingComponent();
}
