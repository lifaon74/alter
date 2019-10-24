export function IndentLines(lines: string[], indent: string = '  ', copy: boolean = false): string[] {
  if (copy) {
    return lines.map((line: string) => (indent + line));
  } else {
    for (let i = 0, l = lines.length; i < l; i++) {
      lines[i] = indent + lines[i];
    }
    return lines;
  }
}

export function ScopeLines(lines: string[], copy: boolean = false): string[] {
  if (copy) {
    return ['{', ...IndentLines(lines, void 0, true), '}'];
  } else {
    IndentLines(lines);
    lines.unshift('{');
    lines.push('}');
    return lines;
  }
}

export function ValueToObservableCode(value: string, expression: boolean = false): string {
  return expression
    ? `$expression(() => (${ value }))`
    : `$observable(${ value })`;
}
