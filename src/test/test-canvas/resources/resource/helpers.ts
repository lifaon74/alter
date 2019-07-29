import {
  CancellablePromise, ICancellablePromise, ICancelToken, PromiseTry, TPromiseOrValue
} from '@lifaon/observables';
import { SORT_NUMBER_DESK, SortIndexes } from '../snippets';
import { IResource } from './interfaces';

/** SCORES **/

export type HTTPResourceScoreGeneratorSync = (response: Response) => number;
export type HTTPResourceScoreGeneratorAsync = (response: Response) => Promise<number>;
export type HTTPResourceScoreGenerator = HTTPResourceScoreGeneratorSync | HTTPResourceScoreGeneratorAsync;

export type TWeightedScore = [number, number];
export type TWeightedScoreGenerator = [HTTPResourceScoreGenerator, number];

export function AggregateScores(scores: TWeightedScore[]): number {
  return scores.reduce((totalScore: number, [score, weight], index: number) => {
    if (Number.isNaN(weight) || (weight < 0)) {
      throw new RangeError(`Expected weight in the range [0, +Infinity] at index ${ index }`);
    } else if ((0 <= score) && (score <= 1)) {
      return totalScore * Math.pow(score, weight);
    } else {
      throw new RangeError(`Expected score in the range [0, 1] at index ${ index }`);
    }
  }, 1);
}


export function GetResourceReachableScore(reachable: boolean): number {
  return reachable ? 1 : 0;
}

export function GetResourceSizeScore(size: number, defaultScore: number): number {
  return (Number.isNaN(size) || (size < 1))
    ? defaultScore
    : (1 / size);
}


export function GetHTTPResourceReachableScore(response: Response): number {
  return GetResourceReachableScore(response.ok);
}

export function GetHTTPResourceSizeScore(response: Response, defaultScore: number = 1 / 1e6): number {
  return (response.headers.has('content-length'))
    ? GetResourceSizeScore(parseInt(response.headers.get('content-length'), 10), defaultScore)
    : defaultScore;
}


export function NormalizeVector(values: number[]): number[] {
  const max: number = Math.max(...values);
  return (max === 0) ? values : values.map(value => (value / max));
}


export function GetHTTPResourceScore(response: Response, weightedScoreGenerators: TWeightedScoreGenerator[]): Promise<number> {
  return Promise.all(
    weightedScoreGenerators.map(([fn, weight]) => PromiseTry<number>(() => fn(response)).then((score: number) => [score, weight]))
  )
    .then(AggregateScores);
}


export function HTTPResourceCompare(responses: Response[], weightedScoreGenerators: TWeightedScoreGenerator[]): Promise<number[]> {
  return Promise.all(
    responses.map((response: Response) => {
      return GetHTTPResourceScore(response, weightedScoreGenerators);
    })
  );
}

/** FETCH **/

export function HTTPResourceFetchScore(request: Request, weightedScoreGenerators: TWeightedScoreGenerator[], token?: ICancelToken): ICancellablePromise<number> {
  return CancellablePromise.fetch(request, void 0, token)
    .then((response: Response) => {
      return GetHTTPResourceScore(response, weightedScoreGenerators);
    });
}

export function HTTPResourceFetchManyScores(requests: Request[], weightedScoreGenerators: TWeightedScoreGenerator[], token?: ICancelToken): ICancellablePromise<number[]> {
  return CancellablePromise.allCallback((token: ICancelToken) => {
    return requests.map((request: Request) => {
      return HTTPResourceFetchScore(request, weightedScoreGenerators, token);
    });
  }, token);
}



export function HTTPResourceFetchBest<T extends IResource>(
  urls: string[],
  weightedScoreGenerators: TWeightedScoreGenerator[],
  toResourceCallback: (blob: Blob, index: number, token: ICancelToken) => TPromiseOrValue<T>,
  token?: ICancelToken
): ICancellablePromise<T> {
  return CancellablePromise.of(HTTPResourceFetchManyScores(
    urls.map(_ => new Request(_, { method: 'HEAD' })),
    weightedScoreGenerators
  ), token)
    .then((scores: number[], token: ICancelToken) => {
      scores = NormalizeVector(scores);
      const sorted: number[] = SortIndexes(scores, SORT_NUMBER_DESK);
      return CancellablePromise.fetch(urls[sorted[0]], void 0, token)
        .then((response: Response) => response.blob())
        .then((blob: Blob) => toResourceCallback(blob, sorted[0], token));
    });
}


/** OTHERS **/


export function ExtensionToMimeType(extension: string, defaultExtension: string | null = 'application/octet-stream'): string | null {
  // https://github.com/jshttp/mime-db
  // https://github.com/jshttp/mime-db/blob/master/db.json
  switch (extension) {
    case 'mp3':
      return 'audio/mpeg';
    case 'ogg':
      return 'audio/ogg';
    case 'wav':
      return 'audio/wav';
    // case 'webm':
    //   return 'audio/weba';

    case 'mp4':
      return 'video/mp4';
    case 'mpeg':
    case 'mpg':
      return 'video/mpeg';
    case 'ogv':
      return 'video/ogg';
    case 'webm':
      return 'video/webm';
    case 'flv':
      return 'video/x-flv';
    case 'x-msvideo':
      return 'video/avi';

    case 'png':
      return 'image/png';
    case 'apng':
      return 'image/apng';
    case 'bmp':
      return 'image/bmp';
    case 'gif':
      return 'image/gif';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    case 'webp':
      return 'image/webp';
    case 'ico':
      return 'image/x-ico';

    default:
      return defaultExtension;
  }
}

export function NormalizeContentType(type: string): string {
  return type.split(';')[0].toLowerCase().trim();
}


export function CloneBlob(blob: Blob): Blob {
  return blob.slice(0, blob.size, blob.type);
}

