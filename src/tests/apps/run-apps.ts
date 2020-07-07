import { runDesktopApp } from './desktop/run';
import { runTagFSApp } from './tag-fs/run';

export async function runApps() {
  await runDesktopApp();
  // await runTagFSApp();
}
