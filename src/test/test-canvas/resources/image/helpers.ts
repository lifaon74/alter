import { GetMediaSupportLevelScoreFromHeadersContentType, TMediaSupportLevel } from '../media/helpers';
import { TLoadingState } from '../resource/interfaces';
import {
  GetHTTPResourceReachableScore, GetHTTPResourceSizeScore, HTTPResourceFetchBest, TWeightedScoreGenerator
} from '../resource/helpers';
import { IImageResource } from './interfaces';
import { ImageResource } from './implementation';

export function GetHTTPImageResourceSupportScore(response: Response, defaultScore?: number): Promise<number> {
  return GetMediaSupportLevelScoreFromHeadersContentType(response.headers, ImageSupportsType, defaultScore);
}

export const imageScoreGenerators: TWeightedScoreGenerator[] = [
  [GetHTTPResourceReachableScore, 1],
  [GetHTTPImageResourceSupportScore, 1],
  [GetHTTPResourceSizeScore, 0.1]
];


export function FetchBestImageResource(urls: string[], id?: string): Promise<IImageResource> {
  return HTTPResourceFetchBest(
    urls,
    imageScoreGenerators,
    (blob: Blob, index: number) => new ImageResource({
      id: (id === void 0) ? urls[index] : id,
      blob: blob
    })
  );
}


/** PLAY WITH HTMLImageElement **/

export function CreateHTMLImageElement(url: string): HTMLImageElement {
  const image: HTMLImageElement = new Image();
  image.src = url;
  return image;
}


/**
 * Infers and returns the state of an HTMLImageElement
 * @param image
 */
export function GetHTMLImageElementState(image: HTMLImageElement): TLoadingState {
  if (image.currentSrc === '') {
    return 'pending';
  } else {
    if (image.complete) {
      return (image.naturalWidth === 0)
        ? 'error'
        : 'complete';
    } else {
      return 'loading';
    }
  }
}

/**
 * Returns a Promise resolved when the HTMLImageElement is loaded (image ready or errored)
 * @param image
 */
export function AwaitHTMLImageElementLoaded(image: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve: any, reject: any) => {
    const onLoad = () => {
      if (image.naturalWidth === 0) {
        onError();
      } else {
        resolve(image);
      }
    };

    const onError = () => {
      reject(new Error(`Image failed to load: ${ image.src.substring(0, 100) }`));
    };

    if (image.complete && (image.currentSrc !== '')) {
      onLoad();
    } else {

      const clear = () => {
        image.removeEventListener('load', _onLoad, false);
        image.removeEventListener('error', _onError, false);
      };

      const _onLoad = () => {
        clear();
        onLoad();
      };

      const _onError = () => {
        clear();
        onError();
      };

      image.addEventListener('load', _onLoad, false);
      image.addEventListener('error', _onError, false);
    }
  });
}

/**
 * Creates an HTMLImageElement from an url and waits until data are loaded
 * @param url
 */
export function LoadAsHTMLImageElement(url: string): Promise<HTMLImageElement> {
  return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(url));
}

/**
 * Creates a canvas and its context containing the image (same size and pixels)
 * @param image
 * @param canvas
 */
export function Create2DContextFromHTMLImageElement(image: HTMLImageElement, canvas: HTMLCanvasElement = document.createElement('canvas')): CanvasRenderingContext2D {
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  ctx.canvas.width = image.naturalWidth;
  ctx.canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0);
  return ctx;
}


export function CreateImageDataFromHTMLImageElement(image: HTMLImageElement, canvas?: HTMLCanvasElement): ImageData {
  const ctx: CanvasRenderingContext2D = Create2DContextFromHTMLImageElement(image, canvas);
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}


/** TEST IMAGE SUPPORT **/

const IMAGE_DATA: any = {
  'apng': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==',
  'webp.lossy': 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
  'webp.lossless': 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  'webp.alpha': 'data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==',
  'webp.animation': 'data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA',
  'png': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAANSURBVBhXY/jPwPAfAAUAAf+mXJtdAAAAAElFTkSuQmCC',
  'jpg': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAMBAAUAAAABAAAAVgMDAAEAAAABAAAAAFEQAAEAAAABAQAAAFERAAQAAAABAAAOw1ESAAQAAAABAAAOwwAAAAAAAYagAACxj//bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAEAAQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APi+iiiv5TP9/D//2Q==',
  'svg': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkaXNwbGF5PSJibG9jayI+PHBhdGggZD0iTTAgMjAwdjIwMGg0MDBWMEgwdjIwMCIgZmlsbD0icmVkIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=',
};


export function SupportsAPNG(): Promise<TMediaSupportLevel> {
  return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(IMAGE_DATA['apng']))
    .then<TMediaSupportLevel>((image: HTMLImageElement) => {
      const ctx: CanvasRenderingContext2D = Create2DContextFromHTMLImageElement(image);
      return (ctx.getImageData(0, 0, 1, 1).data[3] === 0) ? 'yes' : 'no';
    })
    .catch<TMediaSupportLevel>(() => 'no');
}


export type TWebPFeature = 'lossy' | 'lossless' | 'alpha' | 'animation';

export function SupportsWebPFeature(feature: TWebPFeature): Promise<TMediaSupportLevel> {
  // https://developers.google.com/speed/webp/faq
  return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(IMAGE_DATA['webp.' + feature]))
    .then<TMediaSupportLevel, TMediaSupportLevel>(() => 'yes', () => 'no');
}

export function SupportsWebP(features: TWebPFeature[] = ['lossy', 'lossless', 'alpha', 'animation']): Promise<TMediaSupportLevel> {
  const length: number = features.length;
  if (length === 0) {
    return Promise.resolve<TMediaSupportLevel>('no');
  } else {
    return Promise.all(
      features.map((feature: TWebPFeature) => SupportsWebPFeature(feature))
    ).then((supports: TMediaSupportLevel[]) => {
      const supported: number = supports.reduce((supported: number, support: TMediaSupportLevel) => {
        return supported + ((support === 'yes') ? 1 : 0);
      }, 0);
      return (supported === length)
        ? 'yes'
        : (
          (supported === 0)
            ? 'no'
            : 'partially'
        );
    });
  }
}


function TestSupportByCheckingPixelValue(key: string, color: number[]): Promise<TMediaSupportLevel> {
  return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(IMAGE_DATA[key]))
    .then<TMediaSupportLevel>((image: HTMLImageElement) => {
      const ctx: CanvasRenderingContext2D = Create2DContextFromHTMLImageElement(image);
      const imageData: ImageData = ctx.getImageData(0, 0, 1, 1);
      return (
        (imageData.data[0] === color[0])
        && (imageData.data[1] === color[1])
        && (imageData.data[2] === color[2])
        && (imageData.data[3] === color[3])
      ) ? 'yes' : 'no';
    })
    .catch<TMediaSupportLevel>(() => 'no');
}


export function SupportsPNG(): Promise<TMediaSupportLevel> {
  return TestSupportByCheckingPixelValue('png', [0xff, 0, 0, 0xff]);
}

export function SupportsJPG(): Promise<TMediaSupportLevel> {
  return TestSupportByCheckingPixelValue('jpg', [0xfe, 0, 0, 0xff]);
}

export function SupportsSVG(): Promise<TMediaSupportLevel> {
  return TestSupportByCheckingPixelValue('svg', [0xff, 0, 0, 0xff]);
}

export function ImageSupportsType(type: string): Promise<TMediaSupportLevel> {
  return new Promise((resolve: any) => {
    switch (type) {
      case 'image/apng':
        return resolve(SupportsAPNG());
      case 'image/webp':
        return resolve(SupportsWebP());
      case 'image/png':
        return resolve(SupportsPNG());
      case 'image/jpeg':
        return resolve(SupportsJPG());
      case 'image/svg+xml':
        return resolve(SupportsSVG());
      default:
        return resolve('no');
    }
  });
}
