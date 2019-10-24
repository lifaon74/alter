export interface IContainerNodeConstructor {
  new(name?: string, transparent?: boolean): IContainerNode;
}

export interface IContainerNode extends Comment, ParentNode, ChildNode {
  innerHTML: string;

  getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;

  getElementsByTagName(tagName: string): HTMLCollectionOf<Element>;

  getElementById(elementId: string): Element | null;

  closest(selector: string): Element | null;
}
