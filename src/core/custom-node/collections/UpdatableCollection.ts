export type UpdatableCollectionFunction<T> = () => ArrayLike<T>;

export abstract class UpdatableCollection<T> implements ArrayLike<T> {
  protected _length: number;
  protected _updateFunction: UpdatableCollectionFunction<T>;

  protected constructor(updateFunction: UpdatableCollectionFunction<T>) {
    this._length = 0;
    this._updateFunction = updateFunction;
  }

  get length(): number {
    return this._length;
  }

  [index: number]: T;

  * [Symbol.iterator](): Generator<T, void, void> {
    for (let i = 0; i < this._length; i++) {
      yield this[i];
    }
  }

  update(): this {
    const items: ArrayLike<T> = this._updateFunction();
    for (let i = 0; i < this._length; i++) {
      if (this[i] !== items[i]) {
        delete this[i];
      }
    }
    this._length = items.length;
    for (let i = 0; i < this._length; i++) {
      if (this[i] !== items[i]) {
        this[i] = items[i];
      }
    }
    return this;
  }
}

