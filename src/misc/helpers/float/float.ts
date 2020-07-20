export function FloatEquals(a: number, b: number, epsilon: number = FLOAT_SAFE_EPSILON): boolean {
  return Math.abs(a - b) < epsilon;
}

export function FloatIsZero(a: number, epsilon: number = FLOAT_SAFE_EPSILON): boolean {
  return Math.abs(a) < epsilon;
}

export function FloatToString(
  a: number,
  precision: number = 0
): string {
  return (precision <= 0)
    ? a.toString(10)
    : a.toPrecision(precision).replace(/\.?0+$/g, '');
}


export const FLOAT_SAFE_EPSILON = Math.pow(2, -20);
export const FLOAT32_EPSILON = Math.pow(2, -23);
export const FLOAT64_EPSILON = Math.pow(2, -52);
