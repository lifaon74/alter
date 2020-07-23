import { TProgression, TProgressionSpecialState, TProgressionWithSpecialState } from './types';

/**
 * Ensures 'progression' is in the range 0-1
 */
export function NormalizeProgression(progression: TProgression): TProgression {
  return Math.max(0, Math.min(1, progression));
}

export function ProgressionWithSpecialStateToProgression(progression: TProgressionWithSpecialState): TProgression {
  switch (progression) {
    case TProgressionSpecialState.START:
      return 0;
    case TProgressionSpecialState.END:
      return 1;
    default:
      return progression;
  }
}


/**
 * Returns true if 'progression' is a special state
 */
export function IsProgressionSpecialState(progression: TProgressionWithSpecialState): progression is TProgressionSpecialState {
  return (progression === TProgressionSpecialState.START)
    || (progression === TProgressionSpecialState.END);
}

