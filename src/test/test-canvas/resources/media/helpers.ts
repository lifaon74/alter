export type TMediaSupportLevel = 'no' | 'maybe' | 'probably' | 'partially' | 'yes';

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
