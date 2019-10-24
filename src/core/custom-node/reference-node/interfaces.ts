/**
 * A ReferenceNode is a node linked to an other.
 * The 'referenceNode' must always be after 'node', except when node has no parent (in this case 'referenceNode' must be detached too).
 * This behaviour may be used to detect when a node position changed for example.
 */

export type TReferenceNodeMutation =
  'attach' // node has been attached to another node
  | 'detach' // node has been detached from its parent
  | 'move' // node changed its position in the DOM (different parent, or index)
  | 'none' // node is at the same position in the DOM
;

export type TReferenceNodeConstructorArgs = [Node];

export interface IReferenceNodeConstructor {
  nextSibling(node: Node): Node | null;

  new(node: Node): IReferenceNode;
}

export interface IReferenceNode extends Node {
  readonly node: Node;
  readonly nextVirtualSibling: Node | null;

  inferMutation(): TReferenceNodeMutation;

  // updates properly the position of 'referenceNode' relative to 'node'
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

