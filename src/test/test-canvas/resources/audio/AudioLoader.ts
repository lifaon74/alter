import { MediaLoader } from '../media/MediaLoader';
import { MediaSupport} from '../media/MediaHelper';
import { AudioSupportsType } from './AudioHelper';
import { AudioResource } from './AudioResource';
import { ProgressCallback } from '../resource/ResourceHelper';

export class AudioLoader extends MediaLoader {
  constructor() {
    super();
  }

  loadResource(id: string, urls: string[], progress?: ProgressCallback): Promise<AudioResource> {
    return super.loadResource(id, urls, progress) as Promise<AudioResource>;
  }

  protected _blobToResource(id: string, blob: Blob): Promise<AudioResource> {
    return Promise.resolve(new AudioResource({ id: id, blob: blob }));
  }

  protected _supportsType(type: string): Promise<MediaSupport> {
    return AudioSupportsType(type);
  }
}
