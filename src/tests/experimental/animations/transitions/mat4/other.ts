import { mat4, vec3, vec4 } from 'gl-matrix';

export function FromPerspective(out: mat4, v: vec4): mat4 {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = v[0];
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = v[1];
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = v[2];
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = v[3];
  return out;
}

export function IsVec3Null(v: vec3): boolean {
  return (v[0] === 0)
    && (v[1] === 0)
    && (v[2] === 0);
}

export function IsVec4Null(v: vec4): boolean {
  return (v[0] === 0)
    && (v[1] === 0)
    && (v[2] === 0)
    && (v[3] === 0);
}
