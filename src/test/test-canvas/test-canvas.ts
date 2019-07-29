import {
  GetHTTPResourceReachableScore, GetHTTPResourceSizeScore,
  TWeightedScoreGenerator
} from './resources/resource/helpers';
import { GetHTTPImageResourceSupportScore, FetchBestImageResource } from './resources/image/helpers';
import { FetchBestAudioResource, GetHTTPAudioResourceSupportScore } from './resources/audio/helpers';
import { IImageResource } from './resources/image/interfaces';
import { IAudioResource } from './resources/audio/interfaces';



export class Camera {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
}

export abstract class Object2D {
  positionX: number;
  positionY: number;

  abstract render(camera: Camera): void;
}


export class StaticTile extends Object2D {
  readonly image: HTMLImageElement;

  constructor(image: HTMLImageElement) {
    super();
    this.image = image;
  }

  render(camera: Camera): void {
    camera.ctx.drawImage(this.image, this.positionX - camera.positionX, this.positionY - camera.positionY)
  }
}



export class Level {
  items: Object[];
}





export class Engine {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;



  render(): void {

  }

}



export function render(): void {
  console.log('ok');
}



export function testLoading(): void {
  const imageUrls = [
    './samples/images/01.png',
    './samples/images/01.jpg',
    './samples/images/01.webp',
  ];

  const audioUrls = [
    './samples/audio/01.mp3',
    './samples/audio/01.wav',
    './samples/audio/01.ogg',
  ];

  const urls = [
    ...imageUrls,
    ...audioUrls,
  ];

  const imageScoreGenerator: TWeightedScoreGenerator[] = [
    [GetHTTPResourceReachableScore, 1],
    [GetHTTPImageResourceSupportScore, 1],
    [GetHTTPResourceSizeScore, 0.1]
  ];


  const audioScoreGenerator: TWeightedScoreGenerator[] = [
    [GetHTTPResourceReachableScore, 1],
    [GetHTTPAudioResourceSupportScore, 1],
    [GetHTTPResourceSizeScore, 0.1]
  ];

  // HTTPResourceFetchBest(
  //   urls.map(_ => new Request(_, { method: 'HEAD' })),
  //   // imageScoreGenerator
  //   audioScoreGenerator
  // ).then((scores: number[]) => {
  //   scores = NormalizeVector(scores);
  //   const sorted: number[] = SortIndexes(scores, SORT_NUMBER_DESK);
  //   sorted.forEach((i) => {
  //     console.log(urls[i], scores[i]);
  //   });
  // });


  FetchBestImageResource(urls)
    .then((image: IImageResource) => {
      console.log(image.blob.type);
      image.toHTMLElement()
        .then((element: HTMLImageElement) => {
          document.body.appendChild(element);
        });
    });

  FetchBestAudioResource(urls)
    .then((image: IAudioResource) => {
      console.log(image.blob.type);
      image.toHTMLElement()
        .then((element: HTMLAudioElement) => {
          document.body.appendChild(element);
          element.controls = true;
        });
    });
}




export function testCanvas(): void {
  console.log('ok');

  const imageUrls = [
    './samples/images/01.png',
    './samples/images/01.jpg',
    './samples/images/01.webp',
  ];

  const audioUrls = [
    './samples/audio/01.mp3',
    './samples/audio/01.wav',
    './samples/audio/01.ogg',
  ];

  const urls = [
    ...imageUrls,
    ...audioUrls,
  ];

  const imageScoreGenerator: TWeightedScoreGenerator[] = [
    [GetHTTPResourceReachableScore, 1],
    [GetHTTPImageResourceSupportScore, 1],
    [GetHTTPResourceSizeScore, 0.1]
  ];


  const audioScoreGenerator: TWeightedScoreGenerator[] = [
    [GetHTTPResourceReachableScore, 1],
    [GetHTTPAudioResourceSupportScore, 1],
    [GetHTTPResourceSizeScore, 0.1]
  ];

  // HTTPResourceFetchBest(
  //   urls.map(_ => new Request(_, { method: 'HEAD' })),
  //   // imageScoreGenerator
  //   audioScoreGenerator
  // ).then((scores: number[]) => {
  //   scores = NormalizeVector(scores);
  //   const sorted: number[] = SortIndexes(scores, SORT_NUMBER_DESK);
  //   sorted.forEach((i) => {
  //     console.log(urls[i], scores[i]);
  //   });
  // });


  FetchBestImageResource(urls)
    .then((image: IImageResource) => {
      console.log(image.blob.type);
      image.toHTMLElement()
        .then((element: HTMLImageElement) => {
          document.body.appendChild(element);
        });
    });

  FetchBestAudioResource(urls)
    .then((image: IAudioResource) => {
      console.log(image.blob.type);
      image.toHTMLElement()
        .then((element: HTMLAudioElement) => {
          document.body.appendChild(element);
          element.controls = true;
        });
    });

}


