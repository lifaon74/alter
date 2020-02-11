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
  containerComputedSizeKey: 'offsetHeight' | 'offsetWidth';
  containerSizeKey: 'height' | 'width';
  containerComplementarySizeKey: 'height' | 'width';
  pointerPositionKey: 'clientX' | 'clientY';
  touchCoordIndex: number;
}

export type TDirectionConstant = {
  [key in TInfiniteScrollerDirection]: IDirectionDetails;
}

export const INFINITE_SCROLLER_DIRECTION_CONSTANTS: TDirectionConstant = {
  vertical: {
    transformMatrixIndex: 5,
    containerComputedSizeKey: 'offsetHeight',
    containerSizeKey: 'height',
    containerComplementarySizeKey: 'width',
    pointerPositionKey: 'clientY',
    touchCoordIndex: 2,
  },
  horizontal: {
    transformMatrixIndex: 2,
    containerComputedSizeKey: 'offsetWidth',
    containerSizeKey: 'width',
    containerComplementarySizeKey: 'height',
    pointerPositionKey: 'clientX',
    touchCoordIndex: 1,
  }
};
