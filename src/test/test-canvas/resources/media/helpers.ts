import { NormalizeContentType } from '../resource/helpers';

export type TMediaSupportLevel = 'no' | 'maybe' | 'probably' | 'partially' | 'yes';


export function GetMediaSupportLevelScoreFromHeadersContentType(
  headers: Headers,
  supports: (type: string) => Promise<TMediaSupportLevel>,
  defaultScore: number = GetMediaSupportLevelScore('maybe')
): Promise<number> {
  return (headers.has('content-type'))
    ? GetMediaSupportLevelScoreFromContentType(headers.get('content-type'), supports)
    : Promise.resolve(defaultScore);
}

export function GetMediaSupportLevelScoreFromContentType(
  contentType: string,
  supports: (type: string) => Promise<TMediaSupportLevel>,
): Promise<number> {
  return supports(NormalizeContentType(contentType))
    .then(GetMediaSupportLevelScore);
}

export function GetMediaSupportLevelScore(support: TMediaSupportLevel): number {
  switch (support) {
    case 'no':
      return 0;
    case 'maybe':
      return 0.4;
    case 'probably':
      return 0.8;
    case 'partially':
      return 0.9;
    case 'yes':
      return 1;
    default:
      throw new TypeError(`Unsupported media support: ${ support }`);
  }
}
