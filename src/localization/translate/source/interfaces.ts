import { ITranslateParams } from '../service/interfaces';
import { IAsyncSource, IPromiseCancelToken } from '@lifaon/observables/public';

export interface ITranslateSource extends IAsyncSource<string> {
  emit(value: string, params?: ITranslateParams): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
}
