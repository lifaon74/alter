import { TAnimationProgression, TAnimationProgressionState, TProgression } from './types';

/**
 * Ensures 'progression' is in the range 0-1
 */
export function NormalizeProgression(progression: TProgression): number {
  return Math.max(0, Math.min(1, progression));
}

/**
 * Returns true if 'progression' is a special state of an animation
 */
export function IsAnimationProgression(progression: TAnimationProgression): progression is TAnimationProgressionState {
  return (progression === 'start')
    || (progression === 'end');
}

