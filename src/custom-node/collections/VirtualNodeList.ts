import { UpdatableCollection } from './UpdatableCollection';

export class VirtualNodeList<T extends Node> extends UpdatableCollection<T> implements NodeListOf<T> {

  constructor(updateFunction: () => ArrayLike<T>) {
    super(updateFunction);
  }

  item(index: number): T | null {
    return this[index] || null;
  }


  forEach(callback: (value: T, key: number, parent: NodeListOf<T>) => void, thisArg?: any): void {
    for (let i = 0; i < this._length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  }

  * entries(): IterableIterator<[number, T]> {
    for (let i = 0; i < this._length; i++) {
      yield [i, this[i]];
    }
  }

  * keys(): IterableIterator<number> {
    for (let i = 0; i < this._length; i++) {
      yield i;
    }
  }

  * values(): IterableIterator<T> {
    for (let i = 0; i < this._length; i++) {
      yield this[i];
    }
  }

  [Symbol.toStringTag]: string = 'NodeList';
}
