import { IResource, IResourceInit } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { CloneableObject, ICloneableObjectOptions } from '../../misc/CloneableObject';
import { ReadBlobAsArrayBuffer, ReadBlobAsDataURL } from '../async-file-reader';
import {
  CancellablePromise, ICancellablePromise, ICancelToken, CancelToken, TPromiseOrValue
} from '@lifaon/observables';

export const RESOURCE_PRIVATE = Symbol('resource-private');

export interface IResourcePrivate {
  id: string;
  type: string;
  blob: Blob;
}

export interface IResourceInternal extends IResource {
  [RESOURCE_PRIVATE]: IResourcePrivate;
}



export function ConstructResource(
  instance: IResource,
  init: IResourceInit,
  options: ICloneableObjectOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, RESOURCE_PRIVATE);
  const privates: IResourcePrivate = (instance as IResourceInternal)[RESOURCE_PRIVATE];
  privates.id = init.id;
  privates.type = init.type;
  privates.blob = options.shallow ? init.blob : init.blob.slice();
}

export function ResourceGetId(instance: IResource): string {
  return (instance as IResourceInternal)[RESOURCE_PRIVATE].id;
}

export function ResourceGetType(instance: IResource): string {
  return (instance as IResourceInternal)[RESOURCE_PRIVATE].type;
}

export function ResourceGetBlob(instance: IResource): Blob {
  return (instance as IResourceInternal)[RESOURCE_PRIVATE].blob;
}


export class Resource extends CloneableObject implements IResource {

  constructor(init: IResourceInit, options?: ICloneableObjectOptions) {
    super();
    ConstructResource(this, init, options);
  }

  get id(): string {
    return ResourceGetId(this);
  }

  get type(): string {
    return ResourceGetType(this);
  }

  get blob(): Blob {
    return ResourceGetBlob(this);
  }

  toBlob(token?: ICancelToken): ICancellablePromise<Blob> {
    return CancellablePromise.resolve(this.blob, token);
  }

  toArrayBuffer(token?: ICancelToken): ICancellablePromise<ArrayBuffer> {
    return ReadBlobAsArrayBuffer(this.blob, token, true);
  }

  toDataURL(token?: ICancelToken): ICancellablePromise<string> {
    return ReadBlobAsDataURL(this.blob, token, true);
  }

  toObjectURL(token?: ICancelToken): ICancellablePromise<string> {
    return CancellablePromise.try<string>(() => {
      return URL.createObjectURL(this.blob);
    }, token);
  }

  toTemporaryObjectURL<T>(callback: (url: string, token: ICancelToken) => TPromiseOrValue<T>, token: ICancelToken = new CancelToken()): ICancellablePromise<T> {
    return this.toObjectURL(token)
      .then((url: string) => {
        return CancellablePromise.try<T>((token: ICancelToken) => callback.call(this, url, token), token)
          .finally(() => {
            URL.revokeObjectURL(url);
          })
          .cancelled(() => {
            URL.revokeObjectURL(url);
          });
      });
  }
}
