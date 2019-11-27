
/**
 * Creates an HTMLStyleElement with 'css' inside
 */
export function CreateStyleElement(css: string, disabled: boolean = false): HTMLStyleElement {
  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(css));
  document.head.appendChild(styleElement);
  (styleElement.sheet as StyleSheet).disabled = disabled;
  return styleElement;
}

/**
 * Updates css content of an HTMLStyleElement
 */
export function UpdateStyleElement(styleElement: HTMLStyleElement, css: string): HTMLStyleElement {
  styleElement.textContent = css;
  return styleElement;
}

/**
 * Activates an HTMLStyleElement
 */
export function ActivateStyleElement(styleElement: HTMLStyleElement): void {
  (styleElement.sheet as StyleSheet).disabled = false;
  styleElement.removeAttribute('disabled');
}

/**
 * Deactivates an HTMLStyleElement
 */
export function DeactivateStyleElement(styleElement: HTMLStyleElement): void {
  (styleElement.sheet as StyleSheet).disabled = true;
  styleElement.setAttribute('disabled', '');
}

/**
 * Converts an CSSStyleSheet to a css string
 */
export function CSSStyleSheetToCSSString(sheet: CSSStyleSheet): string {
  let css: string = '';
  for (let i = 0, l = sheet.cssRules.length; i < l; i++) {
    css += sheet.cssRules[i].cssText + '\n';
  }
  return css;
}
