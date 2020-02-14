import { IInfiniteScrollerContentLimitStrategy, TInfiniteScrollerDirection } from './interfaces';

/** DEFAULT CONSTANTS */

export const INFINITE_SCROLLER_COORDS_LENGTH: number = 300;
export const INFINITE_SCROLLER_DEFAULT_DIRECTION: TInfiniteScrollerDirection = 'vertical';
export const INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE: number = 100;
export const INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE: number = 500;
export const INFINITE_SCROLLER_DEFAULT_LOAD_UNLOAD_DISTANCE: number = INFINITE_SCROLLER_DEFAULT_UNLOAD_DISTANCE - INFINITE_SCROLLER_DEFAULT_LOAD_DISTANCE;
export const INFINITE_SCROLLER_DEFAULT_CONTENT_LIMIT_STRATEGY: IInfiniteScrollerContentLimitStrategy = 'ignore';

export interface IDirectionDetails {
  transformMatrixIndex: number;
  offsetSizeKey: 'offsetWidth' | 'offsetHeight';
  cssSizeKey: 'width' | 'height';
  cssPositionStartKey: 'left' | 'top';
  cssPositionEndKey: 'right' | 'bottom';
  pointerPositionKey: 'clientY' | 'clientX';
  touchCoordIndex: number;
}

export type TDirectionConstants = {
  [key in TInfiniteScrollerDirection]: IDirectionDetails;
}

export const INFINITE_SCROLLER_DIRECTION_CONSTANTS: TDirectionConstants = {
  horizontal: {
    transformMatrixIndex: 2,
    offsetSizeKey: 'offsetWidth',
    cssSizeKey: 'width',
    cssPositionStartKey: 'left',
    cssPositionEndKey: 'right',
    pointerPositionKey: 'clientX',
    touchCoordIndex: 1,
  },
  vertical: {
    transformMatrixIndex: 5,
    offsetSizeKey: 'offsetHeight',
    cssSizeKey: 'height',
    cssPositionStartKey: 'top',
    cssPositionEndKey: 'bottom',
    pointerPositionKey: 'clientY',
    touchCoordIndex: 2,
  },
};
