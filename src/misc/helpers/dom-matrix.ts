
export function DOMMatrixEquals(a: DOMMatrixReadOnly, b: DOMMatrixReadOnly): boolean {
  return (a.m11 === b.m11)
    && (a.m12 === b.m12)
    && (a.m13 === b.m13)
    && (a.m14 === b.m14)

    && (a.m21 === b.m21)
    && (a.m22 === b.m22)
    && (a.m23 === b.m23)
    && (a.m24 === b.m24)

    && (a.m31 === b.m31)
    && (a.m32 === b.m32)
    && (a.m33 === b.m33)
    && (a.m34 === b.m34)

    && (a.m41 === b.m41)
    && (a.m42 === b.m42)
    && (a.m43 === b.m43)
    && (a.m44 === b.m44);
}

export function DOMMatrixIdentify(matrix: DOMMatrix): DOMMatrix {
  matrix.m11 = 1;
  matrix.m12 = 0;
  matrix.m13 = 0;
  matrix.m14 = 0;

  matrix.m21 = 0;
  matrix.m22 = 1;
  matrix.m23 = 0;
  matrix.m24 = 0;

  matrix.m31 = 0;
  matrix.m32 = 0;
  matrix.m33 = 1;
  matrix.m34 = 0;

  matrix.m41 = 0;
  matrix.m42 = 0;
  matrix.m43 = 0;
  matrix.m44 = 1;

  return matrix;
}
