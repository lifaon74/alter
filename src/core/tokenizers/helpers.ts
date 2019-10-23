export function RegExpWrap(pattern: string): string {
  return '(?:' + pattern + ')';
}

export function RegExpStartEnd(pattern: string): string {
  return '^' + pattern + '$';
}
