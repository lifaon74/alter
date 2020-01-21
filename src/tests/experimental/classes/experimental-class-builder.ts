import { IsType } from '../../../classes/types';
import { IsObject } from '../../../misc/helpers/is/IsObject';
import { CopyOwnDescriptors, Implements, SetConstructor, SetFunctionName } from '../../../misc/helpers/object-helpers';
import { IReadonlyList } from '@lifaon/observables';

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

  protected _supersInitialized: boolean;
  protected _initSupers: (...args: any[][]) => void;

  constructor(
    reference: () => object,
    initSupers: (...args: any[][]) => void,
  ) {
    super(reference);
    this._supersInitialized = false;
  }

  get supersInitialized(): boolean {
    return this._supersInitialized;
  }

  initSupers(...args: any[][]): void {
    if (this._supersInitialized) {
      throw new Error(`Supers already initialized`);
    } else {
      this._supersInitialized = true;
      this._initSupers.apply(this, args);
    }
  }
}

/*------------------------------------------------------------------------------------------------*/


/**
 * Generates a Prototype template for ClassBuilder
 */
export type TPrototypeTemplate = object & {
  [key: string]: ((this: IClassBuilderThis, ...args: any) => any) | Primitive | object;
};

export type TClassBuilderOptionsConstruct = (this: IClassBuilderConstructorThis, ...args: any[]) => (void | any);

export interface IClassBuilderOptions {
  name: string;
  construct?: TClassBuilderOptionsConstruct;
  static?: object;
  prototype?: TPrototypeTemplate;
  extends?: ClassBuilder[];
}

export interface IClassBuilderNormalizedOptions extends Required<IClassBuilderOptions> {
}

export function NormalizeIClassBuilderOptionsName(name: string): string {
  return String(name);
}

export function NormalizeIClassBuilderOptionsConstruct(construct?: TClassBuilderOptionsConstruct): TClassBuilderOptionsConstruct {
  if (construct === void 0) {
    return function (this: IClassBuilderConstructorThis, ...args: any[][]) {
      this.initSupers(...args);
    };
  } else if (typeof construct === 'function') {
    return construct;
  } else {
    throw new TypeError(`Expected void or function as options.construct`);
  }
}

export function NormalizeIClassBuilderOptionsStatic(_static?: object): object {
  if (_static === void 0) {
    return Object.create(null);
  } else if (IsObject(_static)) {
    return _static;
  } else {
    throw new TypeError(`Expected void or object as options.static`);
  }
}

export function NormalizeIClassBuilderOptionsExtends(_extends?: ClassBuilder[]): ClassBuilder[] {
  if (_extends === void 0) {
    return [];
  } else if (Array.isArray(_extends)) {
    return _extends.map((_class: ClassBuilder, index: number) => {
      if (_class instanceof ClassBuilder) {
        return _class;
      } else {
        throw new TypeError(`Expected ClassBuilder at index #${ index } or options.extends`);
      }
    });
  } else {
    throw new TypeError(`Expected void or array as options.extends`);
  }
}

export function NormalizeIClassBuilderOptionsPrototype(prototype?: TPrototypeTemplate): TPrototypeTemplate {
  if (prototype === void 0) {
    return Object.create(null);
  } else if (IsObject(prototype)) {
    return prototype;
  } else {
    throw new TypeError(`Expected void or object as options.prototype`);
  }
}

export function NormalizeIClassBuilderOptions(options: IClassBuilderOptions): IClassBuilderNormalizedOptions {
  return {
    name: NormalizeIClassBuilderOptionsName(options.name),
    construct: NormalizeIClassBuilderOptionsConstruct(options.construct),
    static: NormalizeIClassBuilderOptionsStatic(options.static),
    prototype: NormalizeIClassBuilderOptionsPrototype(options.prototype),
    extends: NormalizeIClassBuilderOptionsExtends(options.extends),
  };
}


/*------------------------------------------------------------------------------------------------*/

/** INTERFACES **/

export interface IClassBuilder {
  name: string;
  construct: TClassBuilderOptionsConstruct;
  static: object;
  prototype: TPrototypeTemplate;
  extends: IReadonlyList<ClassBuilder>;

  build(): any;
}

/** FUNCTIONS **/


/** CONSTRUCTOR **/


/** METHODS **/

export function ClassBuilderBuildStatic(instance: IClassBuilder, target: object): void {
  const privates: any = instance; // TODO;

  CopyOwnDescriptors(privates.static, target);

  for (let i = 0, l = privates.extends.length; i < l; i++) {
    ClassBuilderBuildStatic(privates.extends[i], target);
  }
}


export function ClassBuilderBuildPrototype(instance: IClassBuilder, target: object): void {
  const privates: any = instance; // TODO;

  CopyOwnDescriptors(privates.prototype, target);

  for (let i = 0, l = privates.extends.length; i < l; i++) {
    ClassBuilderBuildPrototype(privates.extends[i], target);
  }
}


export function ClassBuilderBuild(instance: IClassBuilder): any {
  const privates: any = instance; // TODO;

  const _class = function (this: object, ...args: any[]) {
    if (new.target === void 0) {
      throw new SyntaxError(`Must call class '${ privates.name }' with new.`);
    }

    let _this: object = this;
    const $this = new ClassBuilderConstructorThis(
      () => _this,
      (...args: any[][]) => {
        if (args.length === privates.extends.length) {
          privates.extends.forEach((superClass: ClassBuilder, index: number) => {
            const constructResult: object | undefined = superClass.options.construct.apply($this, args[index]);
            if ((constructResult !== void 0) && (constructResult !== _this)) { // returned 'this' is different
              // the returned 'this'.constructor.prototype must contains every methods of this class' prototype
              if (Implements(constructResult, _this, 'exists')) {
                _this = constructResult;
              } else {
                throw new Error(`Returned value must implements all properties of the provided this`);
              }
            }
          });
        } else {
          throw new Error(`Expected ${ privates.extends.length } arguments for initSuper`)
        }
      },
    );

    privates.construct.apply($this, args);
  };


  // set statics
  ClassBuilderBuildStatic(instance, _class);

  // set name
  SetFunctionName(_class, privates.name);

  // elegant toString
  _class.toString = () => `class ${ privates.name } extends A, B, C { [code] }`; // TODO


  const proto: any = ClassBuilderBuildPrototype(instance, Object.create(null));
  SetConstructor(proto, _class);

  _class.prototype = proto;

  return _class;
}


/** CLASS **/

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

  public readonly options: IClassBuilderNormalizedOptions;

  constructor(options: IClassBuilderOptions) {
    this.options = NormalizeIClassBuilderOptions(options);
  }


  // construct($this: ClassBuilderConstructorThis): object {
  //   const options = this.options;
  //   options.construct.apply(void 0, $this);
  //
  //   if (options.construct !== void 0) {
  //     const initArgs: TInitArgs = (options.construct.preInit === void 0)
  //       ? args
  //       : options.construct.apply(void 0, args);
  //
  //     if (options.extends !== void 0) {
  //       if (options.construct.supers !== void 0) {
  //         const superArgs: any[] = options.construct.supers.apply(void 0, initArgs);
  //
  //         options.extends.forEach((superClass: TClassBuilderExtend, index: number) => {
  //           _this = RegisterThis(superClass.construct(_this, thisList, superArgs[index]), thisList);
  //         });
  //       }
  //     }
  //
  //     if (options.construct.init !== void 0) {
  //       _this = RegisterThis(options.construct.init.apply(_this, initArgs) || _this, thisList);
  //     }
  //   }
  //
  //   return _this;
  // }


  build(): any {
    return ClassBuilderBuild(this);
  }

}


/*------------------------------------------------------------------------------------------------*/

export async function experimentClassBuilder() {
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
    construct(...args: any[]): void {
      console.log('construct', args);
      // console.log(this.get('methodA'));
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
  const instance2 = new class2();
  console.log(instance2);

  (window as any).instance2 = instance2;
}
