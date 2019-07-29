import { TLoadingState } from '../resource/interfaces';
import {
  GetMediaSupportLevelScore, GetMediaSupportLevelScoreFromHeadersContentType, TMediaSupportLevel
} from '../media/helpers';
import {
  GetHTTPResourceReachableScore, GetHTTPResourceSizeScore, HTTPResourceFetchBest, TWeightedScoreGenerator
} from '../resource/helpers';
import { AudioResource } from './implementation';
import { IAudioResource } from './interfaces';

export function GetHTTPAudioResourceSupportScore(response: Response, defaultScore: number = GetMediaSupportLevelScore('maybe')): Promise<number> {
  return GetMediaSupportLevelScoreFromHeadersContentType(response.headers, AudioSupportsType, defaultScore);
}


export const audioScoreGenerators: TWeightedScoreGenerator[] = [
  [GetHTTPResourceReachableScore, 1],
  [GetHTTPAudioResourceSupportScore, 1],
  [GetHTTPResourceSizeScore, 0.1]
];

export function FetchBestAudioResource(urls: string[], id?: string): Promise<IAudioResource> {
  return HTTPResourceFetchBest(
    urls,
    audioScoreGenerators,
    (blob: Blob, index: number) => new AudioResource({
      id: (id === void 0) ? urls[index] : id,
      blob: blob
    })
  );
}

/** PLAY WITH HTMLAudioElement **/

export function CreateHTMLAudioElement(source: string): HTMLAudioElement {
  const element: HTMLAudioElement = new Audio();
  if (source) {
    element.src = source;
    element.preload = 'auto';
  }
  return element;
}

export function GetHTMLAudioElementState(audio: HTMLAudioElement): TLoadingState {
  if (audio.currentSrc === '') {
    return 'pending';
  } else {
    throw 'TODO'; // TODO
  }
}


export function AwaitHTMLAudioElementLoaded(audio: HTMLAudioElement): Promise<HTMLAudioElement> {
  return new Promise<HTMLAudioElement>((resolve: any, reject: any) => {
    if (audio.readyState === audio.HAVE_ENOUGH_DATA) {
      resolve(audio);
    } else {
      const clear = () => {
        audio.removeEventListener('loadeddata', onLoad, false);
        audio.removeEventListener('error', onError, false);
      };

      const onLoad = () => {
        clear();
        resolve(audio);
      };

      const onError = () => {
        clear();
        reject(new Error(`Invalid resource path: '${ audio.src }'`));
      };

      audio.addEventListener('loadeddata', onLoad, false);
      audio.addEventListener('error', onError, false);
    }
  });
}


/** TEST AUDIO SUPPORT **/

const AUDIO: HTMLAudioElement = new Audio();

export function AudioSupportsType(type: string): Promise<TMediaSupportLevel> {
  return new Promise((resolve: any) => {
    switch (AUDIO.canPlayType(type)) {
      case 'probably':
        return resolve('probably');
      case 'maybe':
        return resolve('maybe');
      case '':
      default:
        return resolve('no');
    }
  });
}
