import { ICloneableObject, ICloneableObjectConstructor, ICloneableObjectOptions } from '../../misc/CloneableObject';
import { ICancellablePromise, TPromiseOrValue } from '@lifaon/observables';

export type TLoadingState =
  'pending' // waiting to fetch data (ex: waiting for a 'src' attribute)
  | 'loading' // loading data
  | 'complete' // data loaded and ready to be used
  | 'error' // an error occurred (ex: fetching data, decoding, etc...)
  ;

export interface IResourceInit {
  id: string;
  type: string;
  blob: Blob;
}

export interface IResourceConstructor extends ICloneableObjectConstructor<IResourceInit, IResource> {
  new(init: IResourceInit, options?: ICloneableObjectOptions): IResource;
}

export interface IResource extends ICloneableObject, Readonly<IResourceInit> {
  readonly id: string;
  readonly type: string;
  readonly blob: Blob;

  toBlob(): Promise<Blob>;

  toArrayBuffer(): ICancellablePromise<ArrayBuffer>;

  toDataURL(): ICancellablePromise<string>;

  toObjectURL(): ICancellablePromise<string>;

  toTemporaryObjectURL<T>(callback: (url: string) => TPromiseOrValue<T>): ICancellablePromise<T>;
}


