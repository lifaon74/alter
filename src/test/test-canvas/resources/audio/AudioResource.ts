import { Media, MediaConstructOptions, MediaType } from '../media/Media';
import { AwaitHTMLAudioElementLoaded, CreateHTMLAudioElement } from './AudioHelper';

export interface AudioResourceConstructOptions extends Pick<MediaConstructOptions, 'id'| 'blob'> {
}


export class AudioResource extends Media implements AudioResourceConstructOptions {

  constructor(options: AudioResourceConstructOptions, shallow?: boolean) {
    super(Object.assign({ type: 'audio' as  MediaType }, options), shallow);
  }

  toHTMLResource(): Promise<HTMLAudioElement> {
    return this.toTemporaryObjectURL<HTMLAudioElement>((url: string) => {
      return AwaitHTMLAudioElementLoaded(CreateHTMLAudioElement(url));
    });

    // return this.toDataURL()
    //   .then((url: string) => {
    //     return AudioResource.awaitAudioLoaded(AudioResource.createAudio(url));
    //   });
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
