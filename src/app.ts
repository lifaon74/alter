import { test } from './tests/test';


function removeBrowserSyncDiv(): void {
  const element: HTMLElement | null = document.getElementById('__bs_notify__');
  if (element === null) {
    setTimeout(removeBrowserSyncDiv, 10);
  } else {
    element.remove();
  }
}

window.onload = () => {
  removeBrowserSyncDiv();
  test();
};






