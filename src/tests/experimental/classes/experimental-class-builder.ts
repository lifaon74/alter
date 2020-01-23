import { IsType } from '../../../classes/types';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import {
  CopyDescriptors, CopyOwnDescriptors, MustImplement, SetConstructor, SetFunctionName
} from '../../../misc/helpers/object-helpers';
import { IReadonlyList, ReadonlyList } from '@lifaon/observables';
import { ConstructClassWithPrivateMembers } from '../../../misc/helpers/ClassWithPrivateMembers';
import { assert, assertFails } from '../../../classes/asserts';

/** TYPES **/

/**
 * Extracts property names of type 'method' keys from an object
 */
export type TObjectMethodKeys<T extends object> = Extract<{
  [K in keyof T]: IsType<T[K], (...args: any) => any> extends true ? K : never;
} extends { [key: string]: infer V } ? V : never, keyof T>;

/**
 * Extracts property names with a type different than 'method' from an object
 */
export type TObjectAttributeKeys<T extends object> = Extract<{
  [K in keyof T]: IsType<T[K], (...args: any) => any> extends true ? never : K;
} extends { [key: string]: infer V } ? V : never, keyof T>;


type Primitive =
  | string
  | boolean
  | number
  | bigint
  | symbol
  | null
  | undefined;


/*------------*/

export interface IClassBuilderThis {
  readonly reference: object;
  readonly private: object;

  get(propertyKey: PropertyKey): any;

  set(propertyKey: PropertyKey, value: any): void;

  call(propertyKey: PropertyKey, ...args: any[]): void;

  super(path: ClassBuilder[]): IClassBuilderThis;
}

export class ClassBuilderThis implements IClassBuilderThis {
  protected _reference: () => object;
  protected _private: object;

  constructor(reference: () => object) {
    this._reference = reference;
    this._private = Object.create(null);
  }

  get reference(): object {
    return this._reference();
  }

  get private(): object {
    return this._private;
  }

  get(propertyKey: PropertyKey): any {
    throw 'TODO';
  }

  set(propertyKey: PropertyKey, value: any): void {
    throw 'TODO';
  }

  call(propertyKey: PropertyKey, ...args: any[]): void {
    throw 'TODO';
  }

  super(path: ClassBuilder[]): IClassBuilderThis {
    throw 'TODO';
  }
}


export interface IClassBuilderConstructorThis extends IClassBuilderThis {
  readonly supersInitialized: boolean;

  initSupers(...args: any[][]): void;
}

export class ClassBuilderConstructorThis extends ClassBuilderThis implements IClassBuilderThis {

  readonly initSupers: (...args: any[][]) => void;

  constructor(
    reference: () => object,
    initSupers: (...args: any[][]) => void,
  ) {
    super(reference);
    this.initSupers = initSupers;
  }
}

/*------------------------------------------------------------------------------------------------*/

/** TYPES **/

/**
 * Generates a Prototype template for ClassBuilder
 */
export type TPrototypeTemplate = object & {
  [key: string]: ((this: IClassBuilderThis, ...args: any) => any) | Primitive | object;
};

export type TClassBuilderOptionsConstruct = (this: IClassBuilderConstructorThis, ...args: any[]) => (void | object);

export interface IClassBuilderOptions {
  name: string;
  construct?: TClassBuilderOptionsConstruct;
  static?: object;
  prototype?: TPrototypeTemplate;
  extends?: Iterable<ClassBuilder>;
}

/*------------------------------------------------------------------------------------------------*/

/** INTERFACES **/

export interface IClassBuilder extends IClassBuilderOptions {
  readonly name: string;
  readonly construct: TClassBuilderOptionsConstruct;
  readonly static: Readonly<object>;
  readonly prototype: Readonly<TPrototypeTemplate>;
  readonly extends: IReadonlyList<ClassBuilder>;

  build(): any;
}

/** PRIVATES **/

export const CLASS_BUILDER_PRIVATE = Symbol('class-builder-private');

export interface IClassBuilderPrivate {
  name: string;
  construct: TClassBuilderOptionsConstruct;
  static: Readonly<object>;
  prototype: Readonly<TPrototypeTemplate>;
  extends: ClassBuilder[];
  extendsReadonly: IReadonlyList<ClassBuilder>;
}

export interface IClassBuilderInternal extends IClassBuilder {
  [CLASS_BUILDER_PRIVATE]: IClassBuilderPrivate;
}

/** CONSTRUCTOR **/

export function ConstructClassBuilder(
  instance: IClassBuilder,
  options: IClassBuilderOptions,
): void {
  ConstructClassWithPrivateMembers(instance, CLASS_BUILDER_PRIVATE);
  const privates: IClassBuilderPrivate = (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE];
  if (IsObject(options)) {
    if (typeof options.name === 'string') {
      privates.name = options.name;
    } else {
      throw new TypeError(`Expected string as option.name`);
    }

    if (options.static === void 0) {
      privates.static = Object.create(null);
    } else if (IsObject(options.static)) {
      privates.static = options.static;
    } else {
      throw new TypeError(`Expected void or object as options.static`);
    }
    Object.freeze(privates.static);


    if (options.prototype === void 0) {
      privates.prototype = Object.create(null);
    } else if (IsObject(options.prototype)) {
      privates.prototype = options.prototype;
    } else {
      throw new TypeError(`Expected void or object as options.prototype`);
    }
    Object.freeze(privates.prototype);


    if (options.extends === void 0) {
      privates.extends = [];
    } else if (Symbol.iterator in options.extends) {
      privates.extends = Array.from(options.extends).map((_class: ClassBuilder, index: number) => {
        if (_class instanceof ClassBuilder) {
          return _class;
        } else {
          throw new TypeError(`Expected ClassBuilder at index #${ index } or options.extends`);
        }
      });
    } else {
      throw new TypeError(`Expected void or array as options.extends`);
    }
    privates.extendsReadonly = new ReadonlyList(privates.extends);

    if (options.construct === void 0) {
      privates.construct = (privates.extends.length === 0)
        ? () => {
        }
        : function (this: IClassBuilderConstructorThis, ...args: any[][]) {
          this.initSupers(...args);
        };
    } else if (typeof options.construct === 'function') {
      privates.construct = options.construct;
    } else {
      throw new TypeError(`Expected void or function as options.construct`);
    }

  } else {
    throw new TypeError(`Expected object as option`);
  }
}


/** FUNCTIONS **/

export function IsSameReturnedThis(originalThis: object, returnedThis: object | undefined): boolean {
  return ((returnedThis === void 0) || (returnedThis === originalThis));
}

export function IsDifferentReturnedThis(originalThis: object, returnedThis: object | undefined): returnedThis is object {
  return ((returnedThis !== void 0) && (returnedThis !== originalThis));
}

/** METHODS **/

export function ClassBuilderGetName(instance: IClassBuilder): string {
  return (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE].name;
}

export function ClassBuilderGetConstruct(instance: IClassBuilder): TClassBuilderOptionsConstruct {
  return (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE].construct;
}

export function ClassBuilderGetStatic(instance: IClassBuilder): Readonly<object> {
  return (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE].static;
}

export function ClassBuilderGetPrototype(instance: IClassBuilder): Readonly<TPrototypeTemplate> {
  return (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE].prototype;
}

export function ClassBuilderGetExtends(instance: IClassBuilder): IReadonlyList<ClassBuilder> {
  return (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE].extendsReadonly;
}


export function ClassBuilderBuildStatic<TTarget extends object>(instance: IClassBuilder, target: TTarget): TTarget {
  const privates: IClassBuilderPrivate = (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE];

  CopyOwnDescriptors(privates.static, target);

  for (let i = 0, l = privates.extends.length; i < l; i++) {
    ClassBuilderBuildStatic(privates.extends[i], target);
  }

  return target;
}

export function ClassBuilderBuildPrototype<TTarget extends object>(instance: IClassBuilder, target: TTarget): TTarget {
  const privates: IClassBuilderPrivate = (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE];

  CopyOwnDescriptors(privates.prototype, target);

  for (let i = 0, l = privates.extends.length; i < l; i++) {
    ClassBuilderBuildPrototype(privates.extends[i], target);
  }

  return target;
}


export function ClassBuilderConstruct(
  instance: IClassBuilder,
  args: any[],
  getThis: () => object,
  setThis: (newThis: object | undefined) => void
): void {
  const privates: IClassBuilderPrivate = (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE];
  let supersInitialized: boolean = (privates.extends.length === 0);

  const $this = new ClassBuilderConstructorThis(
    () => {
      if (supersInitialized) {
        return getThis();
      } else {
        throw new Error(`Accessing 'this' should be done after calling 'initSuper'`);
      }
    },
    (...args: any[][]) => {
      if (supersInitialized) {
        throw new Error(`Supers already initialized`);
      } else {
        supersInitialized = true;
        if (args.length === privates.extends.length) {
          privates.extends.forEach((superClass: ClassBuilder, index: number) => {
            ClassBuilderConstruct(superClass, args[index], getThis, setThis);
          });
        } else {
          throw new Error(`Expected ${ privates.extends.length } argument(s) for 'initSuper', received ${ args.length }`);
        }
      }
    },
  );

  const newThis: object | undefined = privates.construct.apply($this, args);

  if (supersInitialized) {
    setThis(newThis);
  } else {
    throw new Error(`Supers must be initialized with 'initSuper'`);
  }
}

export function ClassBuilderBuild(instance: IClassBuilder): any {
  const privates: IClassBuilderPrivate = (instance as IClassBuilderInternal)[CLASS_BUILDER_PRIVATE];

  const _class = function (this: object, ...args: any[]) {
    if (new.target === void 0) {
      throw new SyntaxError(`The class '${ privates.name }' must be instantiated with the 'new' keyword.`);
    }

    let _this: object = this;

    ClassBuilderConstruct(
      instance,
      args,
      () => _this,
      (newThis: object | undefined): void => {
        if (IsDifferentReturnedThis(_this, newThis)) {
          MustImplement(newThis, _this, 'exists');
          _this = newThis;
        }
      }
    );

    return _this;
  };

  // set statics
  ClassBuilderBuildStatic(instance, _class);

  // set name
  SetFunctionName(_class, privates.name);

  // elegant toString
  _class.toString = () => `class ${ privates.name } extends A, B, C { [code] }`; // TODO


  const proto: object = ClassBuilderBuildPrototype(instance, Object.create(null));
  SetConstructor(proto, _class);

  _class.prototype = proto;

  return _class;
}


/** CLASS **/


/**
 * TODO:
 *  - create privates
 *  - test
 */
export class ClassBuilder {

  static fromClass(_class: Function): ClassBuilder {
    const superClass = Object.getPrototypeOf(_class.prototype);
    return new ClassBuilder({
      name: _class.name,
      construct(...args: any[]): void {
        // TODO: extra experimental
        try {
          return _class.apply(this.reference);
        } catch {
          return Reflect.construct(_class, args, Object.getPrototypeOf(this.reference));
        }
      },
      prototype: _class.prototype,
      extends: (superClass === null)
        ? []
        : [ClassBuilder.fromClass(superClass)]
    });
  }

  constructor(options: IClassBuilderOptions) {
    ConstructClassBuilder(this, options);
  }

  get name(): string {
    return ClassBuilderGetName(this);
  }

  get construct(): TClassBuilderOptionsConstruct {
    return ClassBuilderGetConstruct(this);
  }

  get static(): Readonly<object> {
    return ClassBuilderGetStatic(this);
  }

  get prototype(): Readonly<TPrototypeTemplate> {
    return ClassBuilderGetPrototype(this);
  }

  get extends(): IReadonlyList<ClassBuilder> {
    return ClassBuilderGetExtends(this);
  }

  build(): any {
    return ClassBuilderBuild(this);
  }

}


/*------------------------------------------------------------------------------------------------*/

async function testDifferentThisReturn() {

  async function testInvalidThisReturn() {
    const RegExpLike = new ClassBuilder({
      name: 'RegExpLike',
      construct(pattern: string, flags?: string): RegExp {
        return new RegExp(pattern, flags);
      },
      prototype: {
        print(message: string): void {
          console.log(message);
        }
      }
    }).build();

    await assertFails(() => new RegExpLike('a', 'g'));
  }

  async function testValidThisReturn() {
    const builder = new ClassBuilder({
      name: 'RegExpLike',
      construct(this: IClassBuilderConstructorThis, pattern: string, flags?: string): RegExp {
        return CopyDescriptors(this.reference, new RegExp(pattern, flags), 'skip');
      },
      prototype: {
        method<T>(value: T): T {
          return value;
        }
      }
    });

    const instance = new (builder.build())('a', 'g');
    await assert(() => (typeof instance.flags === 'string'));
    await assert(() => (instance.flags === 'g'));
    await assert(() => (typeof instance.method === 'function'));
    await assert(() => (instance.method('abc') === 'abc'));
  }

  await testInvalidThisReturn();
  await testValidThisReturn();
}


async function testExtends() {

  const createBuilderA = (): IClassBuilder => {
    return new ClassBuilder({
      name: 'classA',
      construct(this: IClassBuilderConstructorThis, valueA: string): void {
        (this.reference as any).valueA = valueA;
      },
      prototype: {
        methodA(): string {
          return (this.reference as any).valueA;
        }
      }
    });
  };


  async function testInvalidExtendWithMissingInitSupers() {
    const classB = new ClassBuilder({
      name: 'classB',
      construct() {
      },
      extends: [createBuilderA()]
    }).build();

    await assertFails(() => new classB());
  }

  async function testInvalidExtendUsingThisBeforeCallingInitSupers() {
    const classB = new ClassBuilder({
      name: 'classB',
      construct(this: IClassBuilderConstructorThis, valueB: string) {
        (this.reference as any).valueB = valueB;
        this.initSupers(['value-a']);
      },
      extends: [createBuilderA()]
    }).build();

    await assertFails(() => new classB('value-b'));
  }

  async function testInvalidExtendCallingInitSupersWithInvalidNumberOfArguments() {
    const classB = new ClassBuilder({
      name: 'classB',
      construct(this: IClassBuilderConstructorThis) {
        this.initSupers(['value-a'], ['invalid']);
      },
      extends: [createBuilderA()]
    }).build();

    await assertFails(() => new classB());
  }

  async function testValidExtendAnotherClassBuilder() {
    const classB = new ClassBuilder({
      name: 'classB',
      construct(this: IClassBuilderConstructorThis, valueB: string): void {
        this.initSupers(['value-a']);
        (this.reference as any).valueB = valueB;
      },
      prototype: {
        methodB(): string {
          return (this.reference as any).valueB;
        }
      },
      extends: [createBuilderA()]
    }).build();

    const instance = new classB('value-b');
    await assert(() => (instance.valueA === 'value-a'));
    await assert(() => (instance.methodA() === 'value-a'));
    await assert(() => (instance.valueB === 'value-b'));
    await assert(() => (instance.methodB() === 'value-b'));
  }

  await testInvalidExtendWithMissingInitSupers();
  await testInvalidExtendUsingThisBeforeCallingInitSupers();
  await testInvalidExtendCallingInitSupersWithInvalidNumberOfArguments();
  await testValidExtendAnotherClassBuilder();
}

async function experiment() {
  // const builder1 = ClassBuilder.fromClass(class A extends RegExp {
  //   constructor(...args: any[]) {
  //     super('a');
  //   }
  //   methodA(): void {
  //     console.log('methodA from class A');
  //   }
  // });
  //
  // console.log(builder1);

  const builder2 = new ClassBuilder({
    name: 'classA',
    construct(...args: any[]): RegExp {
      console.log('construct', args);
      // console.log(this.get('methodA'));
      return new RegExp('a');
    },
    prototype: {
      methodA(message: string): void {
        console.log(message);
      },
      get attrA(this: IClassBuilderThis): string {
        return this.get('attrB');
      },
      attrB: 'static-b'
    }
  });

  const class2 = builder2.build();
  const instance2 = new class2('arg1', 'arg2');
  console.log(instance2);

  (window as any).instance2 = instance2;
}

export async function experimentClassBuilder() {
  // await testDifferentThisReturn();
  await testExtends();
}