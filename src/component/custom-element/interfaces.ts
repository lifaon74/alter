/**
 * Contains functions and helpers for Custom Element (elements that extend HTMLElement)
 */

export interface ConnectedCallBack {
  connectedCallback(): void;
}

export interface DisconnectedCallBack {
  disconnectedCallback(): void;
}

export interface AttributeChangedCallback {
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
}

