import { ICloneableObjectConstructor, ICloneableObjectOptions } from '../../misc/CloneableObject';
import { IMedia, IMediaConstructor, IMediaInit } from '../media/interfaces';

export interface IImageResourceInit extends Omit<IMediaInit, 'type'>, Partial<Pick<IMediaInit, 'type'>> {
}

export interface IImageConstructor extends IMediaConstructor, ICloneableObjectConstructor<IImageResourceInit, IImageResource> {
  new(init: IImageResourceInit, options?: ICloneableObjectOptions): IImageResource;
}

export interface IImageResource extends IMedia, Readonly<Required<IImageResourceInit>> {
  readonly type: 'image';

  toHTMLElement(): Promise<HTMLImageElement>;
}


