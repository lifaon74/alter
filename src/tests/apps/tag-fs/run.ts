import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';
import { bootStrap } from '../../../core/bootstrap';
import {  TAG_FS_APP_MODULE } from './components/module';
import { AppFileListComponent } from './components/file-list/file-list.component';

export async function runTagFSApp() {
  bootStrap(TAG_FS_APP_MODULE);
  AttachNode(new AppFileListComponent(), document.body);
}
