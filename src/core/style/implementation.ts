import { IStyle, TStyleFunction } from './interfaces';
import { INodeStateObservable } from '../custom-node/node-state-observable/interfaces';
import { uuid } from '../../misc/helpers/uuid';
import { ActivateStyleElement, CreateStyleElement, DeactivateStyleElement } from './functions';
import { RelativeURLPath } from '../../misc/helpers/RelativeURLPath';
import { NodeStateObservable } from '../custom-node/node-state-observable/implementation';


/** FUNCTIONS **/

export function StyleElementToStyleInstance(styleElement: HTMLStyleElement): IStyle {
  const key: string = uuid();
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
        console.log((rule as CSSStyleRule).selectorText);
        break;
      case CSSRule.SUPPORTS_RULE:
        break;
    }
  }

  let countUsage: number = 0;

  return new Style((element: Element): HTMLStyleElement => {
    element.setAttribute(id, '');

    const nodeStateObservable: INodeStateObservable = NodeStateObservable.of(element);

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
    // console.log(dynamicCSS);
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


/** METHODS **/

/* STATIC */

export function StyleStringToStyleInstance(css: string): IStyle {
  return StyleElementToStyleInstance(CreateStyleElement(css, true));
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
  return StyleURLToStyleInstance(RelativeURLPath(moduleURL, url).href);
}


/** CLASS **/

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
