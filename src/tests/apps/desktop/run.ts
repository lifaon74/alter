import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { AppWindowComponent } from './components/window/window.component';
import { bootStrap } from '../../../core/bootstrap';
import { DESKTOP_APP_MODULE } from './components/module';
import { AppApplicationsListComponent } from './components/applications-list/applications-list.component';

export async function runDesktopApp() {
  bootStrap(DESKTOP_APP_MODULE);
  AttachNode(new AppWindowComponent(), document.body);
}
