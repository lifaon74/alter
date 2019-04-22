


export class CubicBezier {

  static NEWTON_ITERATIONS: number = 4;
  static NEWTON_MIN_SLOPE: number = 0.001;
  static SUBDIVISION_PRECISION: number = 0.0000001;
  static SUBDIVISION_MAX_ITERATIONS: number = 10;

  static kSplineTableSize: number = 11;
  static kSampleStepSize: number = 1.0 / (CubicBezier.kSplineTableSize - 1.0);

  // http://easings.net/fr
  static easeInCubic = new CubicBezier(0.55, 0.055, 0.675, 0.19);
  static easeOutCubic = new CubicBezier(0.215, 0.61, 0.355, 1);
  static easeInOutCubic = new CubicBezier(0.645, 0.045, 0.355, 1);

  public readonly p1_x: number;
  public readonly p1_y: number;
  public readonly p2_x: number;
  public readonly p2_y: number;

  private readonly sampleValues: Float32Array;

  constructor(
    p1_x: number,
    p1_y: number,
    p2_x: number,
    p2_y: number
  ) {
    this.p1_x = p1_x;
    this.p1_y = p1_y;
    this.p2_x = p2_x;
    this.p2_y = p2_y;

    if (!(0 <= p1_x) && (p1_x <= 1) && (0 <= p2_x) && (p2_x <= 1)) {
      throw new Error(`bezier x values must be in [0, 1] range`);
    }

    this.sampleValues = new Float32Array(CubicBezier.kSplineTableSize);

    if (p1_x !== p1_y || p2_x !== p2_y) {
      for (let i = 0; i < CubicBezier.kSplineTableSize; ++i) {
        this.sampleValues[i] = this.calcBezier(i * CubicBezier.kSampleStepSize, p1_x, p2_x);
      }
    }
  }

  getValue(x: number) {
    if ((this.p1_x === this.p1_y) && (this.p2_x === this.p2_y)) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return this.calcBezier(this.getTForX(x), this.p1_y, this.p2_y);
  }


  private getTForX(aX: number): number {
    let intervalStart: number = 0.0;
    let currentSample: number = 1;
    const lastSample: number = CubicBezier.kSplineTableSize - 1;

    for (; currentSample !== lastSample && this.sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += CubicBezier.kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    const dist: number = (aX - this.sampleValues[currentSample])
      / (this.sampleValues[currentSample + 1] - this.sampleValues[currentSample]);
    const guessForT: number = intervalStart + dist * CubicBezier.kSampleStepSize;

    const initialSlope: number = this.getSlope(guessForT, this.p1_x, this.p2_x);
    if (initialSlope >= CubicBezier.NEWTON_MIN_SLOPE) {
      return this.newtonRaphsonIterate(aX, guessForT, this.p1_x, this.p2_x);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return this.binarySubdivide(
        aX,
        intervalStart,
        intervalStart + CubicBezier.kSampleStepSize,
        this.p1_x,
        this.p2_x
      );
    }
  }


  private getSlope(aT: number, aA1: number, aA2: number): number {
    return 3.0 * this.A(aA1, aA2) * aT * aT + 2.0 * this.B(aA1, aA2) * aT + this.C(aA1);
  }

  private binarySubdivide(aX: number, aA: number, aB: number, p1_x: number, p2_x: number): number {
    let currentX: number, currentT: number, i: number = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = this.calcBezier(currentT, p1_x, p2_x) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > CubicBezier.SUBDIVISION_PRECISION && ++i < CubicBezier.SUBDIVISION_MAX_ITERATIONS);

    return currentT;
  }

  private newtonRaphsonIterate(aX: number, aGuessT: number, p1_x: number, p2_x: number): number {
    for (let i = 0; i < CubicBezier.NEWTON_ITERATIONS; ++i) {
      const currentSlope: number = this.getSlope(aGuessT, p1_x, p2_x);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      const currentX: number = this.calcBezier(aGuessT, p1_x, p2_x) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }


  private calcBezier(aT: number, aA1: number, aA2: number): number {
    return ((this.A(aA1, aA2) * aT + this.B(aA1, aA2)) * aT + this.C(aA1)) * aT;
  }

  private A(aA1: number, aA2: number): number {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }

  private B(aA1: number, aA2: number): number {
    return 3.0 * aA2 - 6.0 * aA1;
  }

  private C(aA1: number): number {
    return 3.0 * aA1;
  }

}


