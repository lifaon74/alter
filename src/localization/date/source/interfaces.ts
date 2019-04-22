import { IAsyncSource, IPromiseCancelToken } from '@lifaon/observables/public';

export interface IDateFormatSource extends IAsyncSource<string> {
  emit(date: number | Date, options?: Intl.DateTimeFormatOptions): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
}
