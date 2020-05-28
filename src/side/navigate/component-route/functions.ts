import {
  $delay,
  CancellablePromise, ICancellablePromise, ICancellablePromiseOptions, TAbortStrategy
} from '@lifaon/observables';
import { IsNull } from '../../../misc/helpers/is/IsNull';
import { AttachNode, DestroyChildNodes } from '../../../core/custom-node/node-state-observable/mutations';

/** FUNCTIONS **/

export interface NodeSelector {
  querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;

  querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;

  querySelector<E extends Element = Element>(selectors: string): E | null;

  querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;

  querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;

  querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
}

/* FIND ROUTER ELEMENT */

export interface IFindRouterElementOptions extends ICancellablePromiseOptions {
  rootNode?: NodeSelector | null;
  routerId?: string | null;
  timeout?: number; // (default: 5000)
}

export function NormalizeIFindRouterElementOptionsTimeout(timeout?: number): number {
  if (timeout === void 0) {
    return 1000;
  } else if (Number.isSafeInteger(timeout)) {
    if (timeout >= 0) {
      return timeout;
    } else {
      throw new RangeError(`Expected options.timeout greater or equals to 0`);
    }
  } else {
    throw new TypeError(`Expected integer as options.timeout`);
  }
}

export function NormalizeIFindRouterElementOptionsRootNode(node?: NodeSelector | null): NodeSelector {
  if (IsNull(node)) {
    return document;
  } else if (typeof node.querySelector === 'function') {
    return node;
  } else {
    throw new TypeError(`Expected NodeSelector (object having a 'querySelector' function) as options.rootNode`);
  }
}

export function FindRouterElement(options: IFindRouterElementOptions = {}): ICancellablePromise<HTMLElement> {
  return CancellablePromise.try<HTMLElement>(async () => {
    const endDate: number = Date.now() + NormalizeIFindRouterElementOptionsTimeout(options.timeout);
    const rootNode: NodeSelector = NormalizeIFindRouterElementOptionsRootNode(options.rootNode);

    while (Date.now() < endDate) {
      const router: HTMLElement | null = IsNull(options.routerId)
        ? rootNode.querySelector('router')
        : document.getElementById(options.routerId);
      if (router === null) {
        await $delay(50, options).toPromise();
      } else {
        return router;
      }
    }
    throw new Error(`Cannot find any <router/>`);
  }, options as any);
}

/* INJECT COMPONENT IN ROUTER ELEMENT */

export interface IInjectComponentInRouterOptions extends IFindRouterElementOptions {
  component: string | null;
}

export function InjectComponentInRouter(
  options: IInjectComponentInRouterOptions,
): ICancellablePromise<HTMLElement | null> {
  return FindRouterElement(options as any)
    .then((router: HTMLElement): (HTMLElement | null) => {
      DestroyChildNodes(router);
      if (options.component === null) {
        return null;
      } else {
        const node: HTMLElement = document.createElement(options.component);
        AttachNode(node, router);
        return node;
      }
    }, (error: any) => {
      if (options.component === null) {
        return null;
      } else {
        throw error;
      }
    }) as ICancellablePromise<HTMLElement | null>;
}

