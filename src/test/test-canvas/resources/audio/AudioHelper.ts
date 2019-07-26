import { MediaSupport } from '../media/MediaHelper';

export function CreateHTMLAudioElement(source: string): HTMLAudioElement {
  const element: HTMLAudioElement = new Audio();
  if (source) {
    element.src = source;
    element.preload = 'auto';
  }
  return element;
}

export function AwaitHTMLAudioElementLoaded(audio: HTMLAudioElement): Promise<HTMLAudioElement> {
  return new Promise<HTMLAudioElement>((resolve: any, reject: any) => {
    if(audio.readyState === audio.HAVE_ENOUGH_DATA) {
      resolve(audio);
    } else {
      const load = () => {
        clear();
        resolve(audio);
      };

      const error = () => {
        clear();
        reject(new Error(`Invalid resource path: '${audio.src}'`));
      };

      const clear = () => {
        audio.removeEventListener('loadeddata', load, false);
        audio.removeEventListener('error', error, false);
      };

      audio.addEventListener('loadeddata', load, false);
      audio.addEventListener('error', error, false);
    }
  });
}


const AUDIO: HTMLAudioElement = new Audio();
export function AudioSupportsType(type: string): Promise<MediaSupport> {
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