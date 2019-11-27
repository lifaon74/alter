/**
 * Every word are in lowercase and separated with dash '-'.
 * INFO: also know as kebab case
 */

export function IsDashCase(input: string): boolean {
  return (/^[a-z](?:-?[a-z])*$/g).test(input);
}

/**
 * INFO: Assumes input is dash case
 */
export function DashCaseToCamelCase(input: string): string {
  return input.replace(/-([a-z])/g, (match: string) => match[1].toUpperCase() );
}

