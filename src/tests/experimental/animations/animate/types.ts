import { ICancellablePromise, ICancellablePromiseOptions } from '@lifaon/observables';

/**
 * INFO: a <animate function> is a function executing some action(s) depending on the elapsed time, and returns a fulfilled promised when finished
 * @example: (elements: HTMLElement[]) => moveElements(elements)
 */

export type TAnimateFunction<TArgs extends any[]> = (options?: ICancellablePromiseOptions, ...args: TArgs) => ICancellablePromise<void>;
