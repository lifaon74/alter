import { quat, vec3, vec4 } from 'gl-matrix';

export function Vec3LinearInterpolation(
  origin: vec3,
  target: vec3,
  current: vec3,
  t: number
): void {
  const _t: number = 1 - t;

  current[0] = (origin[0] * _t) + (target[0] * t);
  current[1] = (origin[1] * _t) + (target[1] * t);
  current[2] = (origin[2] * _t) + (target[2] * t);
}

export function Vec4LinearInterpolation(
  origin: vec4,
  target: vec4,
  current: vec4,
  t: number
): void {
  const _t: number = 1 - t;

  current[0] = (origin[0] * _t) + (target[0] * t);
  current[1] = (origin[1] * _t) + (target[1] * t);
  current[2] = (origin[2] * _t) + (target[2] * t);
  current[3] = (origin[3] * _t) + (target[3] * t);
}


export function InterpolateTranslation(
  origin: vec3,
  target: vec3,
  current: vec3,
  t: number
): void {
  Vec3LinearInterpolation(origin, target, current, t);
}

export function InterpolateScaling(
  origin: vec3,
  target: vec3,
  current: vec3,
  t: number
): void {
  Vec3LinearInterpolation(origin, target, current, t);
}

export function InterpolateSkewing(
  origin: vec3,
  target: vec3,
  current: vec3,
  t: number
): void {
  Vec3LinearInterpolation(origin, target, current, t);
}

export function InterpolatePerspective(
  origin: vec4,
  target: vec4,
  current: vec4,
  t: number
): void {
  Vec4LinearInterpolation(origin, target, current, t);
}


/**
 * From: https://drafts.csswg.org/css-transforms-2/#interpolation-of-decomposed-3d-matrix-values
 * INFO: use quat.slerp instead of w3c implementation
 */
export function InterpolateQuaternions(
  originQuaternion: quat,
  targetQuaternion: quat,
  currentQuaternion: quat,
  t: number,
): void {
  quat.slerp(currentQuaternion, originQuaternion, targetQuaternion, t);
}

export function InterpolateDecomposedMat4(
  originTranslation: vec3,
  targetTranslation: vec3,
  currentTranslation: vec3,
  originScale: vec3,
  targetScale: vec3,
  currentScale: vec3,
  originSkew: vec3,
  targetSkew: vec3,
  currentSkew: vec3,
  originPerspective: vec4,
  targetPerspective: vec4,
  currentPerspective: vec4,
  originQuaternion: quat,
  targetQuaternion: quat,
  currentQuaternion: quat,
  t: number,
): void {
  InterpolateTranslation(originTranslation, targetTranslation, currentTranslation, t);
  InterpolateScaling(originScale, targetScale, currentScale, t);
  InterpolateSkewing(originSkew, targetSkew, currentSkew, t);
  InterpolatePerspective(originPerspective, targetPerspective, currentPerspective, t);
  InterpolateQuaternions(originQuaternion, targetQuaternion, currentQuaternion, t);
}

