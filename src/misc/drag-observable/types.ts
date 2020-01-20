/** TYPES **/

export interface IPoint2D {
  x: number;
  y: number;
}

export interface IDragObject {
  readonly start: Readonly<IPoint2D>;
  readonly delta: Readonly<IPoint2D>;
}

export interface IDragObservableKeyValueMap {
  'drag-start': IDragObject;
  'drag-move': IDragObject;
  'drag-end': IDragObject;
}
