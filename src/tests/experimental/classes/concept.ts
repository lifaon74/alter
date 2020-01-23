import { Constructor } from '../../../classes/factory';
import {
  CopyDescriptors, CopyOwnDescriptors, GetPropertyDescriptors, HasOwnProperty, HasProperty
} from '../../../misc/helpers/object-helpers';
import { assert } from '../../../classes/asserts';
import { SetInstanceOf } from '../../../classes/instanceof';
import { ExtendableHTMLElement } from '../../../core/custom-node/helpers/ExtendableHTMLElement';

/***
 * INFO: the real problem
 */

class A extends RegExp {
  a: string;

  constructor() {
    super('default');
    this.a = 'never';  // 'this' there will be different than final 'this', so 'a' wont exist
    // so instead:
    const _this: A = new RegExp('a') as A; // we must create first a different _this
    Object.assign(_this, this); // then assign all properties of 'this' to '_this'
    return _this; // nd finally return the new '_this'
  }
}

class B extends A {
  b: string;

  constructor() {
    super();
    this.b = 'never';
    const _this: B = new RegExp('b') as B;
    Object.assign(_this, this);
    return _this;
  }
}



/*------------------------*/

/**
 * Intersection between the object A and B, where A wins on common properties
 */
type TypeIntersection<A, B> = A & Omit<B, keyof A>;
type ClassFactory<TClass extends Constructor, TBase extends Constructor> = Omit<TypeIntersection<TBase, TClass>, 'new'>
  & {
  new(classArgs: ConstructorParameters<TClass>, ...baseArgs: ConstructorParameters<TBase>): TypeIntersection<InstanceType<TBase>, InstanceType<TClass>>;
};


export function ClassConstructorNewThis<
  TOldThis extends object,
  TNewConstructor extends Constructor
>(
  oldThis: TOldThis,
  newConstructor: TNewConstructor,
  newConstructorArgs: ConstructorParameters<TNewConstructor>,
  // oldThisConstructor: Constructor<TOldThis> = oldThis.constructor,
): TypeIntersection<InstanceType<TNewConstructor>, TOldThis> {
  const newThis = Reflect.construct(newConstructor, newConstructorArgs, oldThis.constructor);

  // CopyOwnDescriptors(oldThis, newThis, 'skip');

  /**
   * TODO:
   *  - due to the bind mechanism, the provided this is incorrect => should probably reflect newThis on oldThis
   *  - due to the bind mechanism, the provided this should be reflected each time and the newThis => maybe use proxy
   */
  Array.from(GetPropertyDescriptors(Object.getPrototypeOf(oldThis))).forEach(([propertyKey, descriptor]) => {
    if (!HasOwnProperty(newThis, propertyKey)) {
      let descriptorChanged: boolean = false;
      if ('value' in descriptor) {
        if (typeof descriptor.value === 'function') {
          descriptor.value = descriptor.value.bind(oldThis);
          descriptorChanged = true;
        }
      } else  {
        if (typeof descriptor.get === 'function') {
          descriptor.get = descriptor.get.bind(oldThis);
          descriptorChanged = true;
        }
        if (typeof descriptor.set === 'function') {
          descriptor.set = descriptor.set.bind(oldThis);
          descriptorChanged = true;
        }
      }
      if (descriptorChanged) {
        Object.defineProperty(newThis, propertyKey, descriptor);
      }
    }
  });

  return newThis;
}

// export function ClassToClassFactory<TClass extends Constructor>(_class: TClass) {
//   return <TBase extends Constructor>(superClass: TBase): ClassFactory<TClass, TBase> => {
//
//     const newClass = class extends superClass {
//       constructor(...args: any[]) {
//         if (args.length === 0) {
//           throw new Error(`Expected at least one argument`);
//         } else if (!Array.isArray(args[0])) {
//           throw new TypeError(`Expected array as first argument`);
//         }
//         super(...args.slice(1));
//         // const newThis = Reflect.construct(_class, args[0], newClass);
//         // CopyOwnDescriptors(this, newThis, 'skip');
//         // return newThis;
//         return ClassConstructorNewThis(this, _class, args[0] as ConstructorParameters<TClass>);
//       }
//     };
//
//     CopyDescriptors(_class, newClass, 'skip'); // copy static
//     CopyDescriptors(_class.prototype, newClass.prototype, 'skip'); // copy methods
//
//     // define instanceof
//     let _classPrototypeChain: Function | null = _class;
//     const objectProto = Object.getPrototypeOf(Object);
//     while ((_classPrototypeChain !== null) && (_classPrototypeChain !== objectProto)) {
//       SetInstanceOf(_classPrototypeChain, newClass);
//       _classPrototypeChain = Object.getPrototypeOf(_classPrototypeChain);
//     }
//
//     return newClass as any;
//   };
// }

export function ClassToClassFactory<TClass extends Constructor>(_class: TClass) {
  return <TBase extends Constructor>(superClass: TBase): ClassFactory<TClass, TBase> => {

    const newClass = class extends superClass {
      constructor(...args: any[]) {
        if (args.length === 0) {
          throw new Error(`Expected at least one argument`);
        } else if (!Array.isArray(args[0])) {
          throw new TypeError(`Expected array as first argument`);
        }
        super(...args.slice(1));
        // const newThis = Reflect.construct(_class, args[0], newClass);
        // CopyOwnDescriptors(this, newThis, 'skip');
        // return newThis;
        return ClassConstructorNewThis(this, _class, args[0] as ConstructorParameters<TClass>);
        // return new Proxy(
        //   newThis,
        //   {
        //     get(target: any, propertyKey: PropertyKey, receiver: any): any {
        //       return Reflect.get(target, propertyKey, receiver).bind(newThis);
        //     }
        //   }
        // );
      }
    };

    CopyDescriptors(_class, newClass, 'skip'); // copy static
    CopyDescriptors(_class.prototype, newClass.prototype, 'skip'); // copy methods

    // define instanceof
    let _classPrototypeChain: Function | null = _class;
    const objectProto = Object.getPrototypeOf(Object);
    while ((_classPrototypeChain !== null) && (_classPrototypeChain !== objectProto)) {
      SetInstanceOf(_classPrototypeChain, newClass);
      _classPrototypeChain = Object.getPrototypeOf(_classPrototypeChain);
    }

    return newClass as any;
  };
}


export async function testBasicClassToClassFactory() {
  class A {
    a: string;
    constructor() {
      this.a = 'A-prop-a';
    }
    methodA() {
      return 'A-methodA';
    }
    sharedMethod() {
      return 'A-shared';
    }
  }

  class B2 {
    b2: string;
    constructor() {
      this.b2 = 'B2-prop-b2';
    }
    methodB2() {
      return 'B2-methodB2';
    }
    sharedMethod() {
      return 'B2-shared';
    }
  }

  class B extends B2 {
    b: string;
    constructor() {
      super();
      this.b = 'B-prop-b';
    }
    methodB() {
      return 'B-methodB';
    }
    sharedMethod() {
      return 'B-shared';
    }
  }

  const factoryB = ClassToClassFactory(B);
  const classAB = factoryB(A);

  const instance = new classAB([]);

  await assert(() => instance.a === 'A-prop-a');
  await assert(() => instance.b === 'B-prop-b');
  await assert(() => instance.b2 === 'B2-prop-b2');
  await assert(() => instance.methodA() === 'A-methodA');
  await assert(() => instance.methodB() === 'B-methodB');
  await assert(() => instance.methodB2() === 'B2-methodB2');
  await assert(() => instance.sharedMethod() === 'A-shared');
  await assert(() => instance instanceof classAB);
  await assert(() => instance instanceof A);
  await assert(() => instance instanceof B);
  await assert(() => instance instanceof B2);
}

export async function testClassToClassFactoryReturningDifferentThis() {
  class A extends RegExp {
    a: string;

    constructor(pattern: string, a: string) {
      super('default');
      this.a = a;
      // return ClassConstructorNewThis(this, RegExp, [pattern]);
    }
  }

  class B extends Text {
    b: string;
    constructor(b: string) {
      super('some-text');
      this.b = b;
    }
  }

  class C {
    c: string;
    constructor(c: string) {
      this.c = c;
    }
  }

  const factoryA = ClassToClassFactory(A);
  const factoryB = ClassToClassFactory(B);
  const classABC = factoryA(factoryB(C));
  const classBAC = factoryB(factoryA(C));
  const classAC = factoryA(C);

  // const instanceABC = new classABC(['my-pattern', 'A-prop-a'], ['B-prop-b'], 'C-prop-c');
  const instanceBAC = new classBAC(['B-prop-b'], ['my-pattern', 'A-prop-a'], 'C-prop-c');
  // const instanceAC = new classAC(['my-pattern', 'A-prop-a'], 'C-prop-c');
  // console.log(instanceABC);
  console.log(instanceBAC);
  // console.log(instanceAC);
  instanceBAC.exec('a');
  document.body.appendChild(instanceBAC);
  debugger;
}

export async function testClassToClassFactory() {
  // await testBasicClassToClassFactory();
  await testClassToClassFactoryReturningDifferentThis();
}

export async function experimentClass() {
  await testClassToClassFactory();
}

