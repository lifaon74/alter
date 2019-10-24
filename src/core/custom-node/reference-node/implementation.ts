import {
  ICommentReferenceNodeConstructor, IReferenceNode, IReferenceNodeConstructor, ITextReferenceNodeConstructor,
  TReferenceNodeConstructorArgs, TReferenceNodeMutation
} from './interfaces';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { Constructor, HasFactoryWaterMark } from '../../../classes/factory';


/** CONSTRUCTOR **/

export const REFERENCE_NODE_PRIVATE = Symbol('reference-node-private');

export interface IReferenceNodePrivate {
  node: Node;
}

export interface IReferenceNodeInternal extends IReferenceNode {
  [REFERENCE_NODE_PRIVATE]: IReferenceNodePrivate;
}

export function ConstructReferenceNode(
  instance: IReferenceNode,
  node: Node,
): void {
  ConstructClassWithPrivateMembers(instance, REFERENCE_NODE_PRIVATE);
  (instance as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node = node;
}

export function IsReferenceNode(value: any): value is IReferenceNode {
  return IsObject(value)
    && value.hasOwnProperty(REFERENCE_NODE_PRIVATE as symbol);
}

const IS_REFERENCE_NODE_CONSTRUCTOR = Symbol('is-reference-node-constructor');

export function IsReferenceNodeConstructor(value: any): value is IReferenceNodeConstructor {
  return (typeof value === 'function')
    && (
      (value === CommentReferenceNode)
      || (value === TextReferenceNode)
      || HasFactoryWaterMark(value, IS_REFERENCE_NODE_CONSTRUCTOR)
    );
}


/** METHODS **/

/**
 * Returns the next sibling of this ReferenceNode ignoring following others ReferenceNode
 */
export function ReferenceNodeGetNextVirtualSibling(instance: IReferenceNode): Node | null {
  let node: Node | null = instance;
  while (((node = node.nextSibling) !== null) && !IsReferenceNode(node)) {}
  return node;
}


/**
 * Update properly the position of this ReferenceNode relatively to its 'node'
 */
export function ReferenceNodeUpdate(instance: IReferenceNode): void {
  const targetNode: Node = (instance as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;
  if (targetNode.parentNode === null) {
    if (instance.parentNode !== null) {
      instance.parentNode.removeChild(instance);
    }
  } else {
    targetNode.parentNode.insertBefore(instance, targetNode.nextSibling);
  }
}

/**
 * Ensures than this ReferenceNode requires a 'mutation' before updating it
 */
export function ReferenceNodeUpdateIfMutate(instance: IReferenceNode): void {
  if (ReferenceNodeInferMutation(instance) !== 'none') {
    ReferenceNodeUpdate(instance);
  }
}

/**
 * Infers which kind of mutation append to this ReferenceNode's node
 */
export function ReferenceNodeInferMutation(instance: IReferenceNode): TReferenceNodeMutation {
  const targetNode: Node = (instance as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;

  if (instance.parentNode === null) {
    return (targetNode.parentNode === null)
      ? 'none'
      : 'attach';
  } else if (instance.parentNode !== targetNode.parentNode) {
    return (targetNode.parentNode === null)
      ? 'detach'
      : 'move';
  } else { // same parentNode => move or doesnt move
    // must ensure than all previousSibling of this referenceNode are ReferenceNode pointing to this node
    let node: Node | null = instance;
    while ((node = node.previousSibling) !== null) {
      if (node === instance.node) {
        return 'none';
      } else if (
        !IsReferenceNode(node)
        || (node.node !== targetNode)
      ) {
        break;
      }
    }
    return 'move';
  }
}



export function ReferenceNodeStaticNextSibling(node: Node): Node | null {
  return IsReferenceNode(node.nextSibling)
    ? node.nextSibling.nextVirtualSibling
    : node.nextSibling;
}


export function ReferenceNodeFactory<TBase extends Constructor<Node>>(superClass: TBase) {
  let _superClass: any = superClass;
  while ((_superClass !== Object) && (_superClass !== Node)) {
    _superClass = Object.getPrototypeOf(_superClass);
  }

  if (_superClass !== Node) {
    throw new TypeError(`Expected Node as superClass`);
  }

  // if ((superClass !== Text as any) && (superClass !== Comment as any)) {
  //   throw new TypeError(`Expected Text or Comment as superClass`);
  // }
  // const setSuperArgs = GetSetSuperArgsFunction(IsFactoryClass(superClass));

  return FactoryClass(class ReferenceNode extends superClass implements IReferenceNode {

    static nextSibling(node: Node): Node | null {
      return ReferenceNodeStaticNextSibling(node);
    }

    constructor(...args: any[]) {
      const [node]: TReferenceNodeConstructorArgs = args[0];
      super(...args.slice(1));
      ConstructReferenceNode(this, node);
    }

    get node(): Node {
      return ((this as unknown) as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;
    }

    get nextVirtualSibling(): Node | null {
      return ReferenceNodeGetNextVirtualSibling(this);
    }

    inferMutation(): TReferenceNodeMutation {
      return ReferenceNodeInferMutation(this);
    }

    update(): this {
      ReferenceNodeUpdateIfMutate(this);
      return this;
    }


  })<TReferenceNodeConstructorArgs>('ReferenceNode', IS_REFERENCE_NODE_CONSTRUCTOR);
}

export const CommentReferenceNode: ICommentReferenceNodeConstructor = class CommentReferenceNode extends ReferenceNodeFactory<typeof Comment>(Comment) {
  constructor(node: Node, name: string = 'ref') {
    super([node], name);
  }
};

export const TextReferenceNode: ITextReferenceNodeConstructor = class TextReferenceNode extends ReferenceNodeFactory<typeof Text>(Text) {
  constructor(node: Node) {
    super([node], '');
  }
};

// export const ReferenceNode = ReferenceNodeComment;
