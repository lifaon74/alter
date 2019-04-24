import {
  IReferenceNode, IReferenceNodeConstructor, TReferenceNodeConstructorArgs, TReferenceNodeMutation
} from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import {
  Constructor, FactoryClass, GetSetSuperArgsFunction, HasFactoryWaterMark, IsFactoryClass
} from '../../../classes/factory';
import { IsObject } from '../../../helpers';


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
    && value.hasOwnProperty(REFERENCE_NODE_PRIVATE);
}

const IS_REFERENCE_NODE_CONSTRUCTOR = Symbol('is-reference-node-constructor');
export function IsReferenceNodeConstructor(value: any): value is IReferenceNodeConstructor {
  return (typeof value === 'function') && ((value === ReferenceNodeComment) || (value === ReferenceNodeText) || HasFactoryWaterMark(value, IS_REFERENCE_NODE_CONSTRUCTOR));
}



export function ReferenceNodeUpdateSafe(instance: IReferenceNode): void {
  if (ReferenceNodeInferMutation(instance) !== 'none') {
    ReferenceNodeUpdate(instance);
  }
}

export function ReferenceNodeUpdate(instance: IReferenceNode): void {
  const targetNode: Node = (instance as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;
  if (targetNode.parentNode === null) {
    instance.parentNode.removeChild(instance);
  } else {
    targetNode.parentNode.insertBefore(instance, targetNode.nextSibling);
  }
}

// export function ReferenceNodeRequiresUpdate(instance: IReferenceNode): boolean {
//   const targetNode: Node = (instance as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;
//   if (targetNode.parentNode === null) {
//     return (instance.parentNode !== null);
//   } else if (targetNode.parentNode !== instance.parentNode) {
//     return true;
//   } else { // must ensure than all previousSibling of this referenceNode are ReferenceNode pointing to this node
//     let node: Node = instance;
//     while ((node = node.previousSibling) !== null) {
//       if (node === instance.node) {
//         return false;
//       } else if (
//         !(node instanceof ReferenceNode)
//         || (node.node !== targetNode)
//       ) {
//         return true;
//       }
//     }
//     return true;
//   }
// }


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
    let node: Node = instance;
    while ((node = node.previousSibling) !== null) {
      if (node === instance.node) {
        return 'none';
      } else if (
        !(node instanceof ReferenceNode)
        || (node.node !== targetNode)
      ) {
        break;
      }
    }
    return 'move';
  }
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
    constructor(...args: any[]) {
      const [node]: TReferenceNodeConstructorArgs = args[0];
      super(...args.slice(1));
      ConstructReferenceNode(this, node);
    }

    get node(): Node {
      return ((this as unknown) as IReferenceNodeInternal)[REFERENCE_NODE_PRIVATE].node;
    }

    inferMutation(): TReferenceNodeMutation {
      return ReferenceNodeInferMutation(this);
    }

    update(): this {
      ReferenceNodeUpdateSafe(this);
      return this;
    }

  })<TReferenceNodeConstructorArgs>('ReferenceNode', IS_REFERENCE_NODE_CONSTRUCTOR);
}

export const ReferenceNodeComment: IReferenceNodeConstructor = class ReferenceNodeComment extends ReferenceNodeFactory<typeof Comment>(Comment) {
  constructor(node: Node) {
    super([node], 'ref');
  }
};

export const ReferenceNodeText: IReferenceNodeConstructor = class ReferenceNodeText extends ReferenceNodeFactory<typeof Comment>(Comment) {
  constructor(node: Node) {
    super([node], '');
  }
};

export const ReferenceNode = ReferenceNodeComment;
