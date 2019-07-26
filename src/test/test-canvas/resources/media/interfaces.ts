import { ICloneableObjectConstructor, ICloneableObjectOptions } from '../../misc/CloneableObject';
import { IResource, IResourceConstructor, IResourceInit } from '../resource/interfaces';

// export type TMediaType = 'image' | 'audio' | 'video';
// export type THTMLResource = HTMLImageElement | HTMLAudioElement | HTMLVideoElement;


export interface IMediaInit extends IResourceInit {
}

export interface IMediaConstructor extends IResourceConstructor, ICloneableObjectConstructor<IMediaInit, IMedia> {
  new(init: IMediaInit, options?: ICloneableObjectOptions): IMedia;
}

export interface IMedia extends IResource, Readonly<IMediaInit> {
  toHTMLElement(): Promise<HTMLElement>;
}


