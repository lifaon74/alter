
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
    return this._map.forEach(function (this: any, value: V, key: K, map: Map<K, V>) {
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

  [Symbol.iterator](): Generator<[K, V]> {
    return this.entries();
  }

  * entries(): Generator<[K, V]> {
    const iterator: Iterator<[K, V]> = this._map.entries();
    let result: IteratorResult<[K, V]>;
    while (!(result = iterator.next()).done) {
      this._resetTimer(result.value[0]);
      yield result.value;
    }
  }

  * keys(): Generator<K> {
    const iterator: Iterator<K> = this._map.keys();
    let result: IteratorResult<K>;
    while (!(result = iterator.next()).done) {
      this._resetTimer(result.value);
      yield result.value;
    }
  }

  * values(): Generator<V> {
    const iterator: Iterator<[K, V]> = this._map.entries();
    let result: IteratorResult<[K, V]>;
    while (!(result = iterator.next()).done) {
      this._resetTimer(result.value[0]);
      yield result.value[1];
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
