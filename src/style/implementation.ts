import { UUID } from '../classes/UUID';
import { NodeStateObservableOf } from '../custom-node/node-state-observable/implementation';
import { IStyle, TStyleFunction } from './interfaces';
import { INodeStateObservable } from '../custom-node/node-state-observable/interfaces';
import { RelativeURLPath } from '../helpers';

/**
 * Creates an HTMLStyleElement with 'css' inside
 * @param css
 * @param disabled
 */
export function CreateStyleElement(css: string, disabled: boolean = false): HTMLStyleElement {
  const styleElement: HTMLStyleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(css));
  document.head.appendChild(styleElement);
  styleElement.sheet.disabled = disabled;
  return styleElement;
}

/**
 * Updates css content of an HTMLStyleElement
 * @param styleElement
 * @param css
 */
export function UpdateStyleElement(styleElement: HTMLStyleElement, css: string): HTMLStyleElement {
  styleElement.textContent = css;
  return styleElement;
}

/**
 * Activates an HTMLStyleElement
 * @param styleElement
 */
export function ActivateStyleElement(styleElement: HTMLStyleElement): void {
  styleElement.sheet.disabled = false;
  styleElement.removeAttribute('disabled');
}

/**
 * Deactivates an HTMLStyleElement
 * @param styleElement
 */
export function DeactivateStyleElement(styleElement: HTMLStyleElement): void {
  styleElement.sheet.disabled = true;
  styleElement.setAttribute('disabled', '');
}

/**
 * Converts an CSSStyleSheet to css string
 * @param sheet
 */
export function CSSStyleSheetToCssString(sheet: CSSStyleSheet): string {
  let css: string = '';
  for (let i = 0, l = sheet.cssRules.length; i < l; i++) {
    css += sheet.cssRules[i].cssText + '\n';
  }
  return css;
}



export function StyleStringToStyleInstance(css: string): IStyle {
  return StyleElementToStyleInstance(CreateStyleElement(css, true));
}

export function StyleElementToStyleInstance(styleElement: HTMLStyleElement): IStyle {

  const key: string = UUID.get();
  styleElement.setAttribute('style-sheet-' + key, '');
  DeactivateStyleElement(styleElement);

  const sheet: CSSStyleSheet = styleElement.sheet as CSSStyleSheet;
  const id: string = 'style-' + key;

  for (let i = 0, l = sheet.cssRules.length; i < l; i++) {
    const rule: CSSRule = sheet.cssRules[i];
    switch (rule.type) {
      case CSSRule.STYLE_RULE:
        (rule as CSSStyleRule).selectorText = (rule as CSSStyleRule).selectorText
          .replace(/:host/g, `[${id}]`)
        ;
        break;
      case CSSRule.SUPPORTS_RULE:
        break;
    }
  }

  let countUsage: number = 0;

  return new Style((element: Element): HTMLStyleElement => {
    element.setAttribute(id, '');

    const nodeStateObservable: INodeStateObservable = NodeStateObservableOf(element);

    function onConnect() {
      // console.log('connect');
      countUsage++;
      if (countUsage === 1) {
        ActivateStyleElement(styleElement);
      }
    }

    function onDisconnect() {
      // console.log('disconnect');
      countUsage--;
      if (countUsage === 0) {
        DeactivateStyleElement(styleElement);
      }
    }

    if (nodeStateObservable.state === 'connected') {
      onConnect();
    }

    const connectObserver = nodeStateObservable
      .addListener('connect', onConnect).activate();

    // when disconnected of the dom, deactivate observer
    const disconnectObserver = nodeStateObservable
      .addListener('disconnect', onDisconnect).activate();

    const destroyObserver = nodeStateObservable
      .addListener('destroy', () => {
        destroyObserver.disconnect();
        connectObserver.disconnect();
        disconnectObserver.disconnect();
      }).activate();

    // const dynamicCSS: DynamicCSS = new DynamicCSS(styleElement);
    //
    // if (dynamicCSS.rules.length > 0) {
    //   let requestIdleTimer: any;
    //   function update(): void {
    //     dynamicCSS.update(callback);
    //     requestIdleTimer = (window as any).requestIdleCallback(update);
    //   }
    //   update();
    //
    //   const nodeStateObservable = GetOrCreateNodeStateObservable(element);
    //
    //   const destroyObserver = nodeStateObservable
    //     .addListener('destroy', () => {
    //       destroyObserver.disconnect();
    //       (window as any).cancelIdleCallback(requestIdleTimer);
    //       dynamicCSS.clear();
    //     }).activate();
    // }

    return styleElement;
  });
}



export function StyleURLToStyleInstance(url: string): Promise<IStyle> {
  return fetch(url)
    .then((response: Response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`Failed to fetch style at '${url}'`);
      }
    })
    .then(StyleStringToStyleInstance);
}

export function StyleRelativeURLToStyleInstance(moduleURL: string, url: string): Promise<IStyle> {
  return StyleURLToStyleInstance(RelativeURLPath(moduleURL, url));
}

// export const styleFromString = StyleStringToStyleInstance;
// export const styleFromURL = StyleURLToStyleInstance;
// export const styleFromRelativeURL = StyleRelativeURLToStyleInstance;

export class Style implements IStyle {

  static fromString(css: string): IStyle {
    return StyleStringToStyleInstance(css);
  }

  static fromURL(url: string): Promise<IStyle> {
    return StyleURLToStyleInstance(url);
  }

  static fromRelativeURL(moduleURL: string, url: string): Promise<IStyle> {
    return StyleRelativeURLToStyleInstance(moduleURL, url);
  }

  public readonly insert: TStyleFunction;

  constructor(insert: TStyleFunction) {
    this.insert = insert;
  }
}
