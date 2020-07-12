import { TAnimationProgression, TProgression } from './types';

export function NormalizeProgression(progression: TProgression): number {
  return Math.max(0, Math.min(1, progression));
}

export function IsAnimationProgression(progression: TAnimationProgression): progression is ('start' | 'end') {
  return (progression === 'start')
  || (progression === 'end');
}

