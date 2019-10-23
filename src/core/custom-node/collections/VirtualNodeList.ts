import { UpdatableCollection } from './UpdatableCollection';

export class VirtualNodeList<T extends Node> extends UpdatableCollection<T> implements NodeListOf<T> {

  constructor(updateFunction: () => ArrayLike<T>) {
    super(updateFunction);
  }

  item(index: number): T {
    return this[index] || null as any;
  }


  forEach(callback: (value: T, key: number, parent: NodeListOf<T>) => void, thisArg?: any): void {
    for (let i = 0; i < this._length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  }

  * entries(): Generator<[number, T], void, void> {
    for (let i = 0; i < this._length; i++) {
      yield [i, this[i]];
    }
  }

  * keys(): Generator<number, void, void> {
    for (let i = 0; i < this._length; i++) {
      yield i;
    }
  }

  * values(): Generator<T, void, void> {
    for (let i = 0; i < this._length; i++) {
      yield this[i];
    }
  }

  [Symbol.toStringTag]: string = 'NodeList';
}
