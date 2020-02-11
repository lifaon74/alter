
/** HELPERS **/

/*  CSSTransformMatrix (string) TO/FROM Float32/34Array */

export function DecodeCSSTransformMatrix<T extends (Float32Array | Float64Array)>(matrix: T, transformString: string): T {
  let match: RegExpExecArray | null;
  if ((transformString === 'none') || (transformString === '')) {
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 1;
    matrix[5] = 0;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 1;
  } else if ((match = /^matrix\((.*)\)$/.exec(transformString)) !== null) {
    const values: number[] = match[1].split(',').map(_ => parseFloat(_));
    matrix[0] = values[0];
    matrix[1] = values[2];
    matrix[2] = values[4];
    matrix[3] = values[1];
    matrix[4] = values[3];
    matrix[5] = values[5];
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = values[0];
  } else {
    throw new SyntaxError(`Cannot parse transformString: '${ transformString }'`);
  }
  return matrix;
}

export function EncodeCSSTransformMatrix(matrix: ArrayLike<number>): string {
  return `matrix(${ matrix[0] }, ${ matrix[3] }, ${ matrix[1] }, ${ matrix[4] }, ${ matrix[2] }, ${ matrix[5] })`;
}



export function SetPropertyOrDefault<O extends { [key: string]: any }, P extends string>(target: O, propertyName: P, value: O[P], defaultValue: O[P]): void {
  try {
    target[propertyName] = value;
  } catch (e) {
    target[propertyName] = defaultValue;
  }
}


export function GetWheelDeltaInPx(delta: number, mode: number): number {
  // https://stackoverflow.com/questions/20110224/what-is-the-height-of-a-line-in-a-wheel-event-deltamode-dom-delta-line
  switch (mode) {
    case WheelEvent.DOM_DELTA_PIXEL:
      return delta;
    case WheelEvent.DOM_DELTA_LINE:
      return delta * 33; // at lest if navigator.platform === 'Win32'
    case WheelEvent.DOM_DELTA_PAGE:
      return delta * 300; // personal value
    default:
      throw new TypeError(`Invalid deltaMode`);
  }
}
