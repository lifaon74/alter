
export class TempMap<K, V> {
  private readonly _period: number;
  private readonly _map: Map<K, V>;
  private readonly _timers: Map<K, any>;

  constructor(period: number = 60000) {
    this._period = period;
    this._map = new Map<K, V>();
    this._timers = new Map<K, V>();
  }

  clear(): void {
    return this._map.clear();
  }

  delete(key: K): boolean {
    this._clearTimer(key);
    return this._map.delete(key);
  }

  forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    const _this_ = this;
    return this._map.forEach(function (value: V, key: K, map: Map<K, V>) {
      _this_._resetTimer(key);
      callback.call(this, value, key, map);
    }, thisArg);
  }

  get(key: K): V | undefined {
    this._resetTimer(key);
    return this._map.get(key);
  }

  has(key: K, resetTimer: boolean = true): boolean {
    if (resetTimer) {
      this._resetTimer(key);
    }
    return this._map.has(key);
  }

  set(key: K, value: V): this {
    this._startTimer(key);
    this._map.set(key, value);
    return this;
  }

  * [Symbol.iterator](): IterableIterator<[K, V]> {
    for (const [key, value] of this._map[Symbol.iterator]()) {
      this._resetTimer(key);
      yield [key, value];
    }
  }

  * entries(): IterableIterator<[K, V]> {
    for (const [key, value] of this._map.entries()) {
      this._resetTimer(key);
      yield [key, value];
    }
  }

  * keys(): IterableIterator<K> {
    for (const key of this._map.keys()) {
      this._resetTimer(key);
      yield key;
    }
  }

  * values(): IterableIterator<V> {
    for (const [key, value] of this._map.entries()) {
      this._resetTimer(key);
      yield value;
    }
  }


  protected _resetTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
      this.__setTimer(key);
    }
  }

  protected _startTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
    }
    this.__setTimer(key);
  }

  protected __setTimer(key: K): void {
    this._timers.set(key, setTimeout(() => {
      this._timers.delete(key);
      this._map.delete(key);
    }, this._period));
  }

  protected _clearTimer(key: K): void {
    const timer: any = this._timers.get(key);
    if (timer !== void 0) {
      clearTimeout(timer);
      this._timers.delete(key);
    }
  }
}
