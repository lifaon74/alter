import { IMedia, IMediaInit } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { ICloneableObjectOptions } from '../../misc/CloneableObject';
import { Resource } from '../resource/implementation';

export const MEDIA_PRIVATE = Symbol('media-private');

export interface IMediaPrivate {
  id: string;
  type: string;
  blob: Blob;
}

export interface IMediaInternal extends IMedia {
  [MEDIA_PRIVATE]: IMediaPrivate;
}

export function ConstructMedia(
  instance: IMedia,
  init: IMediaInit,
  options: ICloneableObjectOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, MEDIA_PRIVATE);
  // const privates: IMediaPrivate = (instance as IMediaInternal)[MEDIA_PRIVATE];
}


export abstract class Media extends Resource implements IMedia {

  protected constructor(init: IMediaInit, options?: ICloneableObjectOptions) {
    super(init, options);
    ConstructMedia(this, init, options);
  }

  abstract toHTMLElement(): Promise<HTMLElement>;
}
