import { IAsyncSource } from '../../../../observables/source/interfaces';
import { IPromiseCancelToken } from '../../../../notifications/observables/promise-observable/promise-cancel-token/interfaces';
import { ITranslateParams } from '../service/interfaces';

export interface ITranslateSource extends IAsyncSource<string> {
  emit(value: string, params?: ITranslateParams): Promise<this>;
  emit(promise: Promise<string>, token?: IPromiseCancelToken): Promise<never>;
}
