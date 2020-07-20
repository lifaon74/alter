import { mat4, vec3 } from 'gl-matrix';

export type TInferTranslationResult = vec3 | null;

/*
(
    (origin[0] === target[0])
    && (origin[1] === target[1])
    && (origin[2] === target[2])
    && (origin[3] === target[3])
    && (origin[4] === target[4])
    && (origin[5] === target[5])
    && (origin[6] === target[6])
    && (origin[7] === target[7])
    && (origin[8] === target[8])
    && (origin[9] === target[9])
    && (origin[10] === target[10])
    && (origin[11] === target[11])
    && (origin[12] === target[12])
    && (origin[13] === target[13])
    && (origin[14] === target[14])
    && (origin[15] === target[15])
  )

 */


// WARN probably incorrect
export function InferTranslation(
  origin: mat4,
  target: mat4,
  out: vec3 = vec3.create()
): TInferTranslationResult {
  return (
    (origin[0] === target[0])
    && (origin[1] === target[1])
    && (origin[2] === target[2])
    && (origin[3] === target[3])
    && (origin[4] === target[4])
    && (origin[5] === target[5])
    && (origin[6] === target[6])
    && (origin[7] === target[7])
    && (origin[8] === target[8])
    && (origin[9] === target[9])
    && (origin[10] === target[10])
    && (origin[11] === target[11])
    && (origin[15] === target[15])
  )
    ? vec3.set(
      out,
      target[12] - origin[12],
      target[13] - origin[13],
      target[14] - origin[14],
    )
    : null;
}


// WARN probably incorrect
export function InferScaling(
  origin: mat4,
  target: mat4,
  out: vec3 = vec3.create()
): TInferTranslationResult {
  const o0: number = origin[0],
    o5 = origin[5],
    o10 = origin[10];

  return (
    (origin[1] === target[1])
    && (origin[2] === target[2])
    && (origin[3] === target[3])
    && (origin[4] === target[4])
    && (origin[6] === target[6])
    && (origin[7] === target[7])
    && (origin[8] === target[8])
    && (origin[9] === target[9])
    && (origin[11] === target[11])
    && (origin[12] === target[12])
    && (origin[13] === target[13])
    && (origin[14] === target[14])
    && (origin[15] === target[15])
  )
    ? vec3.set(
      out,
      (o0 === 0) ? (target[0] / o0) : 0,
      (o5 === 0) ? (target[5] / o5) : 0,
      (o10 === 0) ? (target[10] / o10) : 0,
    )
    : null;
}
