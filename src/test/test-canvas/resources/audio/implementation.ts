import { IAudioResource, IAudioResourceInit } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { ICloneableObjectOptions } from '../../misc/CloneableObject';
import { Media } from '../media/implementation';
import { AwaitHTMLAudioElementLoaded, CreateHTMLAudioElement } from './helpers';

export const AudioResource_PRIVATE = Symbol('audioResource-private');

export interface IAudioResourcePrivate {
}

export interface IAudioResourceInternal extends IAudioResource {
  [AudioResource_PRIVATE]: IAudioResourcePrivate;
}

export function ConstructAudioResource(
  instance: IAudioResource,
  init: IAudioResourceInit,
  options: ICloneableObjectOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, AudioResource_PRIVATE);
  // const privates: IAudioResourcePrivate = (instance as IAudioResourceInternal)[AudioResource_PRIVATE];
}


export class AudioResource extends Media implements IAudioResource {

  constructor(init: IAudioResourceInit, options?: ICloneableObjectOptions) {
    if ((init.type !== void 0) && (init.type !== 'audio')) {
      throw new TypeError(`Expected 'audio' as init.type`);
    }

    super(
      Object.assign({
        type: 'audio'
      }, init),
      options
    );
    ConstructAudioResource(this, init, options);
  }

  get type(): 'audio' {
    return 'audio'; // or super.type as 'audio'
  }

  toHTMLElement(): Promise<HTMLAudioElement> {
    return this.toTemporaryObjectURL<HTMLAudioElement>((url: string) => {
      return AwaitHTMLAudioElementLoaded(CreateHTMLAudioElement(url));
    });
  }

  toAudioBuffer(audioContext: AudioContext): Promise<AudioBuffer> {
    return this.toArrayBuffer()
      .then((buffer: ArrayBuffer) => audioContext.decodeAudioData(buffer));
  }

  toAudioBufferSourceNode(audioContext: AudioContext): Promise<AudioBufferSourceNode> {
    return this.toAudioBuffer(audioContext)
      .then((buffer: AudioBuffer) => {
        const source: AudioBufferSourceNode = audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
      });
  }
}
