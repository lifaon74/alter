import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { FromPerspective } from './other';


const tmpMat4: mat4 = mat4.create();

/**
 * From: https://drafts.csswg.org/css-transforms-2/#recomposing-to-a-3d-matrix
 * INFO: try to reduce with fromRotationTranslationScale
 */
export function RecomposeMat4(
  translation: vec3,
  scale: vec3,
  skew: vec3,
  perspective: vec4,
  quaternion: quat,
  out: mat4,
): mat4 {
  // apply perspective
  FromPerspective(out, perspective);

  // apply translation
  mat4.translate(out, out, translation);

  // apply rotation
  mat4.fromQuat(tmpMat4, quaternion);
  mat4.multiply(out, out, tmpMat4);

  // apply skew
  mat4.identity(tmpMat4);

  if (skew[2]) {
    tmpMat4[9] = skew[2];
    mat4.multiply(out, out, tmpMat4);
  }

  if (skew[1]) {
    tmpMat4[9] = 0;
    tmpMat4[8] = skew[1];
    mat4.multiply(out, out, tmpMat4);
  }

  if (skew[0]) {
    tmpMat4[8] = 0;
    tmpMat4[4] = skew[0];
    mat4.multiply(out, out, tmpMat4);
  }

  // apply scale
  mat4.scale(out, out, scale);

  return out;
}
