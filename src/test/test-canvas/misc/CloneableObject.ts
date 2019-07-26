import { Constructor } from '../../../classes/factory';

export interface ICloneableObjectOptions {
  shallow?: boolean;
}

export interface ICloneableObject {
  clone(options?: ICloneableObjectOptions): this;
}

export interface ICloneableObjectConstructor<TInit extends object, TInstance extends TInit> {
 new(init?: TInit, options?: ICloneableObjectOptions): TInstance;
}

export interface ICloneableObjectConstructorNonOptional<TInit extends object, TInstance extends TInit> {
  new(init: TInit, options?: ICloneableObjectOptions): TInstance;
}

/**
 * Assumes the parent implements ICloneableObjectConstructor
 */
export function CloneableObjectFactory<TBase extends Constructor<any>>(superClass: TBase) {
  return class CloneableObject extends superClass {
    constructor(...args: any[]) {
      super(...args);
    }

    clone(options?: ICloneableObjectOptions): this {
      return new (this.constructor as any)(this, options);
    }
  };
}

export abstract class CloneableObject implements ICloneableObject {
  clone(options?: ICloneableObjectOptions): this {
    return new (this.constructor as any)(this, options);
  }
}
