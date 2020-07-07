import { IReadonlySet, ReadonlySet } from '@lifaon/observables';
import { difference, intersection } from '../helpers/set-operations';
import { ISetChange } from './interfaces';


/** CLASS **/

export class SetChange<T> implements ISetChange<T> {
  readonly previous: IReadonlySet<T>;
  readonly current: IReadonlySet<T>;

  private _added: IReadonlySet<T>;
  private _removed: IReadonlySet<T>;
  private _common: IReadonlySet<T>;

  constructor(
    previous: Iterable<T>,
    current: Iterable<T>,
  ) {
    this.previous = new ReadonlySet<T>(previous);
    this.current = new ReadonlySet<T>(current);
  }

  get added(): IReadonlySet<T> {
    if (this._added === void 0) {
      this._added = new ReadonlySet<T>(difference(this.current, this.previous));
    }
    return this._added;
  }

  get removed(): IReadonlySet<T> {
    if (this._removed === void 0) {
      this._removed = new ReadonlySet<T>(difference(this.previous, this.current));
    }
    return this._removed;
  }

  get common(): IReadonlySet<T> {
    if (this._common === void 0) {
      this._common = new ReadonlySet<T>(intersection(this.previous, this.current));
    }
    return this._common;
  }
}
