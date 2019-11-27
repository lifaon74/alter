
export function HighlightStringPortion(
  input: string,
  start: number,
  end: number,
  overflowLimit: number = 100,
  startMarker: string = '■■■',
  endMarker: string = '■■■',
) {
  return StringOverflowStart(input.slice(0, start), overflowLimit)
    + startMarker + input.slice(start, end) + endMarker
    + StringOverflowEnd(input.slice(end), overflowLimit);
}

/**
 * If the 'input' string is longer than 'limit', returns a string composed of 'prefix' followed by the last 'limit' characters
 * Else returns the entire string
 */
export function StringOverflowStart(
  input: string,
  limit: number,
  prefix: string = '...'
): string {
  return (limit > input.length)
    ? (prefix + input.slice(-limit))
    : input;
}

/**
 * If the 'input' string is longer than 'limit', returns a string composed of the first 'limit' characters followed by 'postfix'
 * Else returns the entire string
 */
export function StringOverflowEnd(
  input: string,
  limit: number,
  postfix: string = '...'
): string {
  return (limit > input.length)
    ? (input.slice(0, limit) + postfix)
    : input;
}
