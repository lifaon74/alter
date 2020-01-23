export type TErrorStrategy =
  'resolve' // the error is skipped, and the HandleError will return true, meaning that the operation is allowed
  | 'skip' // the error is skipped, and the HandleError will return false, meaning that the operation is not allowed
  | 'warn' // the error is skipped but displayed as a warning, and the HandleError will return false, meaning that the operation is not allowed
  | 'throw' // (default) the error is thrown, meaning that the operation is not allowed
;

/**
 * Handles an error with a specific 'strategy'
 *  - if true is returned => the operation is allowed
 *  - if false is returned => the operation is not allowed
 */
export function HandleError(
  error: () => Error,
  strategy: TErrorStrategy = 'throw'
): boolean {
  switch (strategy) {
    case 'resolve':
      return true;
    case 'skip':
      return false;
    case 'warn':
      console.warn(error());
      return false;
    case 'throw':
      throw error();
    default:
      throw new TypeError(`Unexpected strategy: ${ strategy }`);
  }
}
