
/**
 * A ReferenceNode is a node linked to an other.
 * The 'referenceNode' must always be after 'node', except when node has no parent (in this case 'referenceNode' must be detached too).
 * This behaviour may be used to detect when a node position changed for example.
 */

export type TReferenceNodeMutation = 'attach' | 'detach' | 'move' | 'none';

export type TReferenceNodeConstructorArgs = [Node];

export interface IReferenceNodeConstructor {
  nextSibling(node: Node): Node | null;
  new(node: Node): IReferenceNode;
}

export interface IReferenceNode extends Node {
  readonly node: Node;
  readonly nextVirtualSibling: Node | null;

  inferMutation(): TReferenceNodeMutation;
  // update properly the position of 'referenceNode' relative to 'node'
  update(): this;
}


export interface ICommentReferenceNodeConstructor extends IReferenceNodeConstructor {
  new(node: Node, name?: string): ICommentReferenceNode;
}

export interface ICommentReferenceNode extends IReferenceNode, Comment {
}


export interface ITextReferenceNodeConstructor extends IReferenceNodeConstructor {
  new(node: Node): ITextReferenceNode;
}

export interface ITextReferenceNode extends IReferenceNode, Text {
}

