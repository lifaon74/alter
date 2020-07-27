import { TTouchFrameObservableMatrix } from './interfaces';
import { TouchFrameObservable } from './implementation';

export async function debugTouchFrameObservable() {
  const element = document.createElement('div');
  const size: number = 600;
  element.style.width = `${ size }px`;
  element.style.height = `${ size }px`;
  element.style.border = `2px solid gray`;
  document.body.appendChild(element);

  const observable = new TouchFrameObservable(window);
  observable.pipeTo((matrix: TTouchFrameObservableMatrix) => {
    console.log('matrix', matrix.toString());
    element.style.transform = matrix.toString();
  }).activate();
}
