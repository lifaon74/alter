import { ICloneableObjectConstructor, ICloneableObjectOptions } from '../../misc/CloneableObject';
import { IMedia, IMediaConstructor, IMediaInit } from '../media/interfaces';

export interface IAudioResourceInit extends Omit<IMediaInit, 'type'>, Partial<Pick<IMediaInit, 'type'>> {
}

export interface IAudioConstructor extends IMediaConstructor, ICloneableObjectConstructor<IAudioResourceInit, IAudioResource> {
  new(init: IAudioResourceInit, options?: ICloneableObjectOptions): IAudioResource;
}

export interface IAudioResource extends IMedia, Readonly<Required<IAudioResourceInit>> {
  readonly type: 'audio';

  toHTMLElement(): Promise<HTMLAudioElement>;

  toAudioBuffer(audioContext: AudioContext): Promise<AudioBuffer>;

  toAudioBufferSourceNode(audioContext: AudioContext): Promise<AudioBufferSourceNode>;
}


