import {
  GetHTTPResourceReachableScore, GetHTTPResourceSizeScore, HTTPResourceFetch, HTTPResourceFetchBest, NormalizeVector
} from './resources/resource/loader/helpers';
import { SORT_NUMBER_DESK, SortIndexes } from './resources/snippets';
import { GetHTTPImageResourceSupportScore } from './resources/image/helpers';


export class Object {
  position: Uint8Array;
}

export class Level {
  items: Object[];
}



export class Brick {
  render(): void {

  }
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



export function testCanvas(): void {
  console.log('ok');

  const urls = [
    './samples/01.png',
    './samples/01.jpg',
    './samples/01.webp',
  ];

  HTTPResourceFetchBest(
    urls.map(_ => new Request(_, { method: 'HEAD' })),
    [
      [GetHTTPResourceReachableScore, 1],
      [GetHTTPImageResourceSupportScore, 1],
      // [GetHTTPResourceSizeScore, 0.1]
    ]
  ).then((scores: number[]) => {
    console.log(scores);
    scores = NormalizeVector(scores);
    // const sorted: number[] = SortIndexes(scores, SORT_NUMBER_DESK);
    // sorted.forEach((i) => {
    //   console.log(urls[i], scores[i]);
    // });
  });
}


