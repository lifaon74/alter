import { IAsyncSource } from '../../../../observables/source/interfaces';
import { IPromiseCancelToken } from '../../../../notifications/observables/promise-observable/promise-cancel-token/interfaces';

export interface IDateFormatSource extends IAsyncSource<string> {
  emit(date: number | Date, options?: Intl.DateTimeFormatOptions): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
}
