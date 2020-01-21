/** INTERFACES **/

export interface IInstanceConstructor  {
  new<TInstance extends object, TPrototype extends object>(instance: TInstance, proto?: TPrototype): IInstance<TInstance, TPrototype>;
}

export interface IInstance<TInstance extends object, TPrototype extends object> {
  readonly instance: TInstance;
  readonly proto: TPrototype;

  prop<T = any>(propertyKey: PropertyKey): T | undefined;

  /**
   * Assigns a value to the property bound to 'constructor'
   * @Example:
   *  - .prop('a') = 10  /!\ NOT POSSIBLE because only variable can be on the left side
   *  - .assign('a', 10) <==> super.a = 10
   */
  assign(propertyKey: PropertyKey, value: any): void;


  /**
   * Calls a method of the class
   * @Example:
   *  - .call('a', 10) <==> super.a(10) (!) only if 'a' is a function for 'super'
   */
  call<T = any>(propertyKey: PropertyKey, ...args: any[]): T;

  /**
   * Gets a "get" property of the class
   * @Example:
   *  - .get('a') <==> super.a (!) only if 'a' is a getter for 'super'
   */
  get<T = any>(propertyKey: PropertyKey): T;

  /**
   * Sets a "set" property of the class
   * @Example:
   *  - .set('a', 10) <==> super.a = 10 (!) only if 'a' is a setter for 'super'
   */
  set(propertyKey: PropertyKey, value: any): void;

  /**
   * Calls a method of the class
   * @Example:
   *  - .apply('a', [1, 2]) <==> super.a(1, 2) (!) only if 'a' is a function for 'super'
   */
  apply<T = any>(propertyKey: PropertyKey, args?: any[]): T;
}
