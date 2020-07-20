import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { TTransitionFunction } from './types';
import { DecomposeMat4 } from './mat4/decompose';
import { MatrixToString } from './mat4/to-string';
import { TProgression } from '../types';
import { InterpolateDecomposedMat4 } from './mat4/interpolate';
import { RecomposeMat4 } from './mat4/recompose';

/**
 * Creates a transition from a 4x4 transform matrix to another
 */
export function CreateGenericTransformMatrixTransition(
  origin: mat4,
  target: mat4,
): TTransitionFunction<mat4> {
  // https://medium.com/swlh/understanding-3d-matrix-transforms-with-pixijs-c76da3f8bd8
  // https://research.cs.wisc.edu/graphics/Courses/838-s2002/Papers/polar-decomp.pdf
  //
  // https://link.springer.com/content/pdf/10.1007/s11075-016-0098-7.pdf
  // https://en.wikipedia.org/wiki/Singular_value_decomposition
  // https://scicomp.stackexchange.com/questions/8930/fast-algorithm-for-polar-decomposition
  // An_algorithm_to_compute_the_polar_decomposition_of
  //
  // https://www.the-art-of-web.com/css/3d-transforms/

  const originTranslation: vec3 = vec3.create();
  const targetTranslation: vec3 = vec3.create();
  const currentTranslation: vec3 = vec3.create();

  const originScale: vec3 = vec3.create();
  const targetScale: vec3 = vec3.create();
  const currentScale: vec3 = vec3.create();

  const originSkew: vec3 = vec3.create();
  const targetSkew: vec3 = vec3.create();
  const currentSkew: vec3 = vec3.create();

  const originPerspective: vec4 = vec4.create();
  const targetPerspective: vec4 = vec4.create();
  const currentPerspective: vec4 = vec4.create();

  const originQuaternion: quat = quat.create();
  const targetQuaternion: quat = quat.create();
  const currentQuaternion: quat = quat.create();

  const currentMatrix: mat4 = mat4.create();

  // const printMatrixState = (
  //   name: string,
  //   matrix: mat4,
  //   translation: vec3,
  //   scale: vec3,
  //   skew: vec3,
  //   perspective: vec4,
  //   quaternion: quat,
  // ) => {
  //   console.warn(name);
  //   console.log(MatrixToString(matrix, 4, 4));
  //   console.log('translation', vec3.str(translation));
  //   console.log('scale', vec3.str(scale));
  //   console.log('skew', vec3.str(skew));
  //   console.log('perspective', vec4.str(perspective));
  //   console.log('quaternion', quat.str(quaternion));
  // }

  if (!DecomposeMat4(
    origin,
    originTranslation,
    originScale,
    originSkew,
    originPerspective,
    originQuaternion,
  )) {
    console.log(MatrixToString(origin, 4, 4));
    throw new Error(`Cannot decompose 'origin'`);
  }

  if (!DecomposeMat4(
    target,
    targetTranslation,
    targetScale,
    targetSkew,
    targetPerspective,
    targetQuaternion,
  )) {
    console.log(MatrixToString(target, 4, 4));
    throw new Error(`Cannot decompose 'target'`);
  }

  // printMatrixState(
  //   'origin',
  //   origin,
  //   originTranslation,
  //   originScale,
  //   originSkew,
  //   originPerspective,
  //   originQuaternion,
  // );
  //
  // printMatrixState(
  //   'target',
  //   target,
  //   targetTranslation,
  //   targetScale,
  //   targetSkew,
  //   targetPerspective,
  //   targetQuaternion,
  // );


  return (progression: TProgression): mat4 => {
    InterpolateDecomposedMat4(
      originTranslation,
      targetTranslation,
      currentTranslation,
      originScale,
      targetScale,
      currentScale,
      originSkew,
      targetSkew,
      currentSkew,
      originPerspective,
      targetPerspective,
      currentPerspective,
      originQuaternion,
      targetQuaternion,
      currentQuaternion,
      progression,
    );

    // printMatrixState(
    //   'current',
    //   currentMatrix,
    //   currentTranslation,
    //   currentScale,
    //   currentSkew,
    //   currentPerspective,
    //   currentQuaternion,
    // );

    return RecomposeMat4(
      currentTranslation,
      currentScale,
      currentSkew,
      currentPerspective,
      currentQuaternion,
      currentMatrix,
    );
  };
}

export function CreateTransformMatrixTransition(
  origin: mat4,
  target: mat4,
): TTransitionFunction<mat4> {
  return TransformMatrixEquals(origin, target)
    ? (() => target)
    : CreateGenericTransformMatrixTransition(origin, target);
}

// const printMatrixState = (
//   name: string,
//   matrix: mat4,
//   translation: vec3,
//   scale: vec3,
//   skew: vec3,
//   perspective: vec4,
//   quaternion: quat,
// ) => {
//   console.warn(name);
//   console.log(MatrixToString(matrix, 4, 4));
//   console.log('translation', vec3.str(translation));
//   console.log('scale', vec3.str(scale));
//   console.log('skew', vec3.str(skew));
//   console.log('perspective', vec4.str(perspective));
//   console.log('quaternion', quat.str(quaternion));
// }

export function TransformMatrixEquals(a: mat4, b: mat4): boolean {
  for (let i: number = 0; i < 16; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/* EXPERIMENTAL */

// export function CreateGenericTransformMatrixTransition(
//   originTranslation: vec3,
//   targetTranslation: vec3,
//   originScale: vec3,
//   targetScale: vec3,
//   originSkew: vec3,
//   targetSkew: vec3,
//   originPerspective: vec4,
//   targetPerspective: vec4,
//   originQuaternion: quat,
//   targetQuaternion: quat,
// ): TTransitionFunction<mat4> {
//
//   const currentTranslation: vec3 = vec3.create();
//   const currentScale: vec3 = vec3.create();
//   const currentSkew: vec3 = vec3.create();
//   const currentPerspective: vec4 = vec4.create();
//   const currentQuaternion: quat = quat.create();
//
//   const currentMatrix: mat4 = mat4.create();
//
//   return (progression: TProgression): mat4 => {
//     InterpolateDecomposedMat4(
//       originTranslation,
//       targetTranslation,
//       currentTranslation,
//       originScale,
//       targetScale,
//       currentScale,
//       originSkew,
//       targetSkew,
//       currentSkew,
//       originPerspective,
//       targetPerspective,
//       currentPerspective,
//       originQuaternion,
//       targetQuaternion,
//       currentQuaternion,
//       progression,
//     );
//
//     // printMatrixState(
//     //   'current',
//     //   currentMatrix,
//     //   currentTranslation,
//     //   currentScale,
//     //   currentSkew,
//     //   currentPerspective,
//     //   currentQuaternion,
//     // );
//
//     return RecomposeMat4(
//       currentTranslation,
//       currentScale,
//       currentSkew,
//       currentPerspective,
//       currentQuaternion,
//       currentMatrix,
//     );
//   };
// }
//
//
// export function CreateTranslateTransformMatrixTransition(
//   originTranslation: vec3,
//   targetTranslation: vec3,
//   currentScale: vec3,
//   currentSkew: vec3,
//   currentPerspective: vec4,
//   currentQuaternion: quat,
// ): TTransitionFunction<mat4> {
//   const currentMatrix: mat4 = mat4.create();
//   const _translation: vec3 = vec3.create();
//   return (progression: TProgression): mat4 => {
//     return RecomposeMat4(
//       currentTranslation,
//       currentScale,
//       currentSkew,
//       currentPerspective,
//       currentQuaternion,
//       currentMatrix,
//     );
//   };
// }
// // export function CreateTranslateTransformMatrixTransition(
// //   origin: mat4,
// //   translation: vec3,
// // ): TTransitionFunction<mat4> {
// //   const currentMatrix: mat4 = mat4.create();
// //   const _translation: vec3 = vec3.create();
// //   return (progression: TProgression): mat4 => {
// //     return RecomposeMat4(
// //       currentTranslation,
// //       currentScale,
// //       currentSkew,
// //       currentPerspective,
// //       currentQuaternion,
// //       currentMatrix,
// //     );
// //   };
// // }
//
// // export function CreateScalingTransformMatrixTransition(
// //   scaling: vec3,
// // ): TTransitionFunction<mat4> {
// //   const currentMatrix: mat4 = mat4.create();
// //   return (progression: TProgression): mat4 => {
// //     InterpolateScalingMat4(scaling, currentMatrix, progression);
// //     return currentMatrix;
// //   };
// // }
//
// export function CreateTransformMatrixTransition(
//   origin: mat4,
//   target: mat4,
// ): TTransitionFunction<mat4> {
//   if (TransformMatrixEquals(origin, target)) {
//     return () => target;
//   } else {
//
//     // https://medium.com/swlh/understanding-3d-matrix-transforms-with-pixijs-c76da3f8bd8
//     // https://research.cs.wisc.edu/graphics/Courses/838-s2002/Papers/polar-decomp.pdf
//     //
//     // https://link.springer.com/content/pdf/10.1007/s11075-016-0098-7.pdf
//     // https://en.wikipedia.org/wiki/Singular_value_decomposition
//     // https://scicomp.stackexchange.com/questions/8930/fast-algorithm-for-polar-decomposition
//     // An_algorithm_to_compute_the_polar_decomposition_of
//     //
//     // https://www.the-art-of-web.com/css/3d-transforms/
//
//     const originTranslation: vec3 = vec3.create();
//     const targetTranslation: vec3 = vec3.create();
//
//     const originScale: vec3 = vec3.create();
//     const targetScale: vec3 = vec3.create();
//
//     const originSkew: vec3 = vec3.create();
//     const targetSkew: vec3 = vec3.create();
//
//     const originPerspective: vec4 = vec4.create();
//     const targetPerspective: vec4 = vec4.create();
//
//     const originQuaternion: quat = quat.create();
//     const targetQuaternion: quat = quat.create();
//
//
//     if (!DecomposeMat4(
//       origin,
//       originTranslation,
//       originScale,
//       originSkew,
//       originPerspective,
//       originQuaternion,
//     )) {
//       console.log(MatrixToString(origin, 4, 4));
//       throw new Error(`Cannot decompose 'origin'`);
//     }
//
//     if (!DecomposeMat4(
//       target,
//       targetTranslation,
//       targetScale,
//       targetSkew,
//       targetPerspective,
//       targetQuaternion,
//     )) {
//       console.log(MatrixToString(target, 4, 4));
//       throw new Error(`Cannot decompose 'target'`);
//     }
//
//     // printMatrixState(
//     //   'origin',
//     //   origin,
//     //   originTranslation,
//     //   originScale,
//     //   originSkew,
//     //   originPerspective,
//     //   originQuaternion,
//     // );
//     //
//     // printMatrixState(
//     //   'target',
//     //   target,
//     //   targetTranslation,
//     //   targetScale,
//     //   targetSkew,
//     //   targetPerspective,
//     //   targetQuaternion,
//     // );
//
//     const translation: vec3 = vec3.create();
//     vec3.subtract(translation, targetTranslation, originTranslation);
//     const isNullTranslation: boolean = IsVec3Null(translation);
//
//     const scaling: vec3 = vec3.create();
//     vec3.subtract(scaling, targetScale, originScale);
//     const isNullScaling: boolean = IsVec3Null(scaling);
//
//     const skewing: vec3 = vec3.create();
//     vec3.subtract(skewing, targetSkew, originSkew);
//     const isNullSkewing: boolean = IsVec3Null(skewing);
//
//     const perspective: vec4 = vec4.create();
//     vec4.subtract(perspective, targetPerspective, originPerspective);
//     const isNullPerspective: boolean = IsVec4Null(perspective);
//
//     const isNullRotation: boolean = quat.exactEquals(originQuaternion, targetQuaternion);
//
//     if (
//       !isNullTranslation
//       && isNullScaling
//       && isNullSkewing
//       && isNullPerspective
//       && isNullRotation
//     ) { // pure translation
//       console.log('pure translation');
//       return CreateTranslateTransformMatrixTransition(origin, translation);
//     }
//
//     // if (
//     //   isNullTranslation
//     //   && !isNullScaling
//     //   && isNullSkewing
//     //   && isNullPerspective
//     //   && isNullRotation
//     // ) { // pure scaling
//     //   return CreateScalingTransformMatrixTransition(translation);
//     // }
//     //
//     // if (
//     //   isNullTranslation
//     //   && isNullScaling
//     //   && !isNullSkewing
//     //   && isNullPerspective
//     //   && isNullRotation
//     // ) { // pure skewing
//     //   // TODO
//     // }
//     //
//     // if (
//     //   isNullTranslation
//     //   && isNullScaling
//     //   && !isNullSkewing
//     //   && isNullPerspective
//     //   && isNullRotation
//     // ) { // pure skewing
//     //   // TODO
//     // }
//
//     return CreateGenericTransformMatrixTransition(
//       originTranslation,
//       targetTranslation,
//       originScale,
//       targetScale,
//       originSkew,
//       targetSkew,
//       originPerspective,
//       targetPerspective,
//       originQuaternion,
//       targetQuaternion,
//     );
//   }
//
//
//   // TODO infer translation, rotation, skew, scale
// }
//
