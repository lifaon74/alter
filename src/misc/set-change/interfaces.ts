import { IReadonlySet } from '@lifaon/observables';


/** INTERFACES **/


export interface ISetChangeConstructor {
  new <T>(
    previous: Iterable<T>,
    current: Iterable<T>,
  ): ISetChange<T>;
}


/**
 * Represents a change in a set, from 'previous' to 'current'.
 * Provides useful shortcuts (added, removed, common), to detect what changes apenned
 */
export interface ISetChange<T> {
  readonly previous: IReadonlySet<T>;
  readonly current: IReadonlySet<T>;

  readonly added: IReadonlySet<T>;
  readonly removed: IReadonlySet<T>;
  readonly common: IReadonlySet<T>;
}

