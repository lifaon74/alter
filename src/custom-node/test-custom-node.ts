import { ExtendableHTMLElement } from './helpers/ExtendableHTMLElement';
import { AttachNode, DestroyNodeSafe } from './node-state-observable/mutations';
import { NodeStateObservable } from './node-state-observable/implementation';
import { TimerObservable } from '../../observables/timer-observable/implementation';
import { mapPipe } from '../../operators/pipes/mapPipe';
import { AddCustomNodeCompleteSupportForNode } from './node-state-observable/interceptors';
import { ContainerNode } from './container-node/implementation';
import { DynamicTextNode } from './dynamic-node/dynamic-text-node/implementation';
import { DynamicConditionalNode } from './dynamic-node/dynamic-conditional-node/implementation';
import { DynamicAttribute } from './dynamic-node/dynamic-element-node/dynamic-attribute/implementation';
import { DynamicProperty } from './dynamic-node/dynamic-element-node/dynamic-property/implementation';
import { DynamicClass } from './dynamic-node/dynamic-element-node/dynamic-class/implementation';
import { DynamicClassList } from './dynamic-node/dynamic-element-node/dynamic-class-list/implementation';
import { DynamicStyleList } from './dynamic-node/dynamic-element-node/dynamic-style-list/implementation';
import { IObservable } from '../../core/observable/interfaces';
import { DynamicForLoopNode } from './dynamic-node/dynamic-for-loop-node/implementation';
import { Observable } from '../../core/observable/public';
import { Pipe } from '../../core/observable-observer/implementation';
import { IPipe } from '../../core/observable-observer/interfaces';
import { IObserver } from '../../core/observer/interfaces';
import { Expression } from '../../observables/expression/implementation';
import { ISource } from '../../observables/source/interfaces';
import { Source } from '../../observables/source/implementation';
import { DynamicStyle } from './dynamic-node/dynamic-element-node/dynamic-style/implementation';

function testExtendableHTMLElement() {
  class A extends ExtendableHTMLElement {
    public a: number;

    constructor(a: number) {
      super('a-node');
      this.a = a;
    }
  }

  const a = new A(10);
  console.log(a.a);
  document.body.appendChild(a);
  console.log((document.body.firstElementChild as A).a);
}

function testNodeStateObservable() {
  const node = document.createElement('div');

  const observable = new NodeStateObservable(node)/*.useDOMObserver()*/
    .on('connect', () => {
      console.log('connect');
    })
    .on('disconnect', () => {
      console.log('disconnect');
    })
    .on('destroy', () => {
      console.log('destroy');
      for (const observer of Array.from(observable.observers)) {
        observer.disconnect();
      }
    });

  AttachNode(node, document.body);
  // document.body.appendChild(node);

  (window as any).observable = observable;
  (window as any).node = node;

  setTimeout(() => {
    DestroyNodeSafe(node);
  }, 1000);
}


// NAME: AlterJS  => al-

function testContainerNode() {
  const node = new ContainerNode();
  node.appendChild(new Text('hello'));

  document.body.appendChild(node);
  // AttachNode(node, document.body);

  (window as any).node = node;
}


function testDynamicTextNode() {
  const node = new DynamicTextNode();
  AttachNode(node, document.body);

  new TimerObservable(10)
    .pipeThrough(mapPipe<void, string>(() => new Date().toISOString()))
    .pipeTo(node);

  (window as any).node = node;

  setTimeout(() => {
    DestroyNodeSafe(node);
  }, 1000);
}




function testDynamicConditionalNode() {
  const node = new DynamicConditionalNode(() => new Text('if - hello'));
  AttachNode(node, document.body);

  (window as any).node = node;
}

function testDynamicAttribute() {
  const node = document.createElement('my-element');
  AttachNode(node, document.body);

  const observer = new DynamicAttribute(node, 'my-attribute').activate();
  observer.emit('attr-value');

  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicProperty() {
  const node = document.createElement('input');
  AttachNode(node, document.body);

  const observer = new DynamicProperty<any>(node, 'readonly').activate();
  observer.emit(true);

  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicClass() {
  const node = document.createElement('my-element');
  AttachNode(node, document.body);

  const observer = new DynamicClass(node, 'my-class').activate();
  observer.emit(true);

  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicClassList() {
  const node = document.createElement('my-element');
  AttachNode(node, document.body);

  const observer = new DynamicClassList(node).activate();
  observer.emit('class1 class2');

  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicStyle() {
  const node = document.createElement('my-element');
  AttachNode(node, document.body);

  const observer = new DynamicStyle(node, 'font-size.px').activate();
  observer.emit(12);


  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicStyleList() {
  const node = document.createElement('my-element');
  AttachNode(node, document.body);

  const observer = new DynamicStyleList(node).activate();
  // observer.emit('color: blue');
  // observer.emit({ color: 'blue' });
  // observer.emit([['color', 'blue']]);
  observer.emit({ 'font-size.px': 12 });

  (window as any).node = node;
  (window as any).observer = observer;
}

function testDynamicForLoopNode() {
  const node = new DynamicForLoopNode((item: IObservable<string>, index: IObservable<number>) => {
    const container = document.createElement('div');
    container.appendChild(new Text('item: '));
    container.appendChild(new DynamicTextNode().observe(item).activate());
    container.appendChild(new Text(', index: '));
    container.appendChild(new DynamicTextNode().observe(index as any).activate());
    return container;
  });

  AttachNode(node, document.body);

  (window as any).node = node;

  const sources: IPipe<IObserver<string>, IObservable<string>>[] = Array.from({ length: 10 }, () => {
    return Pipe.create<string, string>();
  });
  const observables: IObservable<string>[] = sources.map(_ => _.observable);
  const observers: IObserver<string>[] = sources.map(_ => _.observer);

  node.emit(observables);

  for (const observer of observers) {
    observer.emit(Math.random().toString(10));
  }

  (window as any).node = node;
  (window as any).observers = observers;
}


function testDynamicTextNodeWithExpression() {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  });

  const frag = document.createDocumentFragment();

  for (let i = 0 ; i < 1000; i++) {
    const container = document.createElement('div');
    container.appendChild(new Text('date: '));

    const node = new DynamicTextNode();
    AttachNode(node, container);

    new Expression<string>(() => {
      // return i.toString(10);
      // return Date.now().toString(10);
      return formatter.format(Date.now());
    }).pipeTo(node);

    AttachNode(container, frag);
  }

  AttachNode(frag, document.body);

  /*(window as any).node = node;*/
}


function testSourceProxy(): void {

  type SourceCast<T extends object> = {
    [P in keyof T]: ISource<T[P]>;
  };

  /*function createDataProxy<T extends object>(data: T): [T, SourceCast<T>] {
    const sources: any = new Map<string, ISource<any>>();

    const sourcesProxy = new Proxy(data, {
      get(target: any, propertyName: string) {
        if (propertyName.startsWith('$$')) {
          if (!sources.has(propertyName)) {
            const source: ISource<any> = new Source();
            sources.set(propertyName, source);
            source.emit(target[propertyName.slice(2)]);
          }
          return sources.get(propertyName);
        } else {
          return target[propertyName];
        }
      },
      set(target: any, propertyName: string, value: any) {
        if (propertyName.startsWith('$$')) {
          if (!sources.has(propertyName)) {
            const source: ISource<any> = new Source();
            sources.set(propertyName, source);
          }
          sources.get(propertyName).emit(value);
        } else {
          target[propertyName] = value;
        }
        return true;
      }
    });

    const dataProxy = new Proxy(data, {
      get(target: any, propertyName: string) {
        if (propertyName.startsWith('$$')) {
          throw new Error(`Cannot get a property starting with $$`);
        } else {
          return target[propertyName];
        }
      },
      set(target: any, propertyName: string, value: any) {
        if (propertyName.startsWith('$$')) {
          throw new Error(`Cannot set a property starting with $$`);
        } else {
          if (!sources.has(propertyName)) {
            const source: ISource<any> = new Source();
            sources.set(propertyName, source);
          }
          target[propertyName] = value;
          sources.get(propertyName).emit(value);
        }
        return true;
      }
    });

    return [dataProxy, sourcesProxy];
  }

  const [data, sources] = createDataProxy({
    a: true,
    b: {
      c: false
    }
  });*/

  function createDataProxy<T extends object>(data: T): T {
    const sources: any = new Map<string, ISource<any>>();

    const sourcesProxy = new Proxy(data, {
      get(target: any, propertyName: string) {
        // debugger;
        if (propertyName.startsWith('$$')) {
          propertyName = propertyName.slice(2);
          if (!sources.has(propertyName)) {
            const source: ISource<any> = new Source();
            sources.set(propertyName, source);
            source.emit(target[propertyName]);
          }
          return sources.get(propertyName);
        } else {
          return target[propertyName];
        }
      },
      set(target: any, propertyName: string, value: any) {
        // debugger;
        if (propertyName.startsWith('$$')) {
          throw new Error(`Cannot set a property starting with $$`);
        } else{
          if (!sources.has(propertyName)) {
            const source: ISource<any> = new Source();
            sources.set(propertyName, source);
          }
          target[propertyName] = value;
          sources.get(propertyName).emit(value);
        }

        return true;
      }
    });


    return sourcesProxy;
  }

  const proxy = createDataProxy({
    a: true,
    b: {
      c: false
    }
  });

  (proxy as any)['$$a'].pipeTo((value: any) => {
    console.log('a updated', value);
  }).activate();

  (window as any).proxy = proxy;
  // (window as any).data = data;
}



function testSourceProxy2(): void {

  class SourceProxy {
    public readonly sources: Map<string, ISource<any>>;

    public readonly templateProxy: any;
    public readonly dataProxy: any;

    constructor() {
      this.sources = new Map<string, ISource<any>>();
      this.templateProxy = this._createTemplateProxy('');
      this.dataProxy = this._createDataProxy('');
    }

    protected _setValue(path: string, propertyName: string, value: any): boolean {
      if (propertyName.startsWith('$$')) {
        throw new Error(`Cannot set a property starting with $$`);
      } else {
        const _path: string = path + '.' + propertyName;
        if (this.sources.has(_path)) {
          const sourceValue = this.sources.get(_path).value;
          if ((typeof sourceValue === 'object') && (sourceValue !== null)) {
            for (const prop of Object.keys(sourceValue)) {
              sourceValue[prop] = void 0;
            }
          }
        } else {
          const source: ISource<any> = new Source();
          this.sources.set(_path, source);
        }

        if ((typeof value === 'object') && (value !== null)) {
          Object.freeze(value);
          const proxyObject = this._createDataProxy(_path);
          for (const prop of Object.keys(value)) {
            proxyObject[prop] = value[prop];
          }
          value = proxyObject;
        }
        this.sources.get(_path).emit(value);
        return true;
      }
    }

    protected _ownKeys(path: string): PropertyKey[] {
      const keys: Set<string> = new Set<string>();
      for (const key of this.sources.keys()) {
        if (key.startsWith(path)) {
          const _key: string = key.slice(path.length + 1).split('.')[0];
          if (_key !== '') {
            keys.add(_key);
          }
        }
      }
      return Array.from(keys);
    }

    protected _createTemplateProxy(path: string): any {
      return new Proxy(Object.create(null), {
        get: (target: any, propertyName: string) => {
          if (propertyName.startsWith('$$')) {
            if (!this.sources.has(path)) {
              const source: ISource<any> = new Source();
              this.sources.set(path, source);
            }
            return this.sources.get(path);
          } else {
            return this._createTemplateProxy(path + '.' + propertyName);
          }
        },
        set: (target: any, propertyName: string, value: any) => {
          return this._setValue(path, propertyName, value);
        },
        ownKeys: () => {
          return this._ownKeys(path);
        }, // https://stackoverflow.com/questions/40352613/why-does-object-keys-and-object-getownpropertynames-produce-different-output
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      });
    }

    protected _createDataProxy(path: string): any {
      return new Proxy(Object.create(null), {
        get: (target: any, propertyName: string) => {
          if (propertyName.startsWith('$$')) {
            throw new Error(`Cannot get a property starting with $$`);
          } else {
            const _path: string = path + '.' + propertyName;
            if (this.sources.has(_path)) {
              return this.sources.get(_path).value;
            } else {
              return void 0;
            }
          }
        },
        set: (target: any, propertyName: string, value: any) => {
          return this._setValue(path, propertyName, value);
        },
        deleteProperty: (target: any, propertyName: string) => {
          return this._setValue(path, propertyName, void 0);
        },
        ownKeys: () => {
          return this._ownKeys(path);
        },
        getOwnPropertyDescriptor() {
          return {
            enumerable: true,
            configurable: true,
          };
        }
      });
    }

  }

  const proxy = new SourceProxy();

  proxy.templateProxy.a.$$.pipeTo((value: any) => {
    if (value) {
      console.log('a emit', value.b);
    }
  }).activate();

  proxy.templateProxy.a.b.$$.pipeTo((value: any) => {
    console.log('b emit', value);
  }).activate();

  const b = { b: true };
  // proxy.templateProxy.a = 1;
  // proxy.templateProxy.b = 1;

  // proxy.templateProxy.a = b; // b emit true, a emit { b: true }
  // proxy.templateProxy.a.b = false; // b emit false
  proxy.templateProxy.a = { b: '5' }; // b emit '5', a emit { b: '5'' }
  proxy.templateProxy.a = { }; // b emit '5', a emit { b: '5'' }

  (window as any).templateProxy = proxy.templateProxy;
  (window as any).dataProxy = proxy.dataProxy;


  // interface Form {
  //   language: {
  //     code: '',
  //     title: ''
  //   },
  //   emails: '',
  //   subject: '',
  //   clientName: '',
  //   salesRep: {
  //     name: '',
  //     email: ''
  //   },
  //   boutique: {
  //     name: '',
  //     address: '',
  //     number: ''
  //   }
  // }
  //
  // interface Response {
  //   fields: Form; // default values
  //   body: string; // template: "Dear M {{ clientName }}, ... {{ boutique.name }} ... {{ salesRep.name}} ... "
  // }
}



/*-------------------------------------------*/



export function testCustomNode() {
  AddCustomNodeCompleteSupportForNode();

  // testExtendableHTMLElement();
  // testNodeStateObservable();

  // testContainerNode();

  // testDynamicTextNode();
  // testDynamicConditionalNode();
  // testDynamicAttribute();
  // testDynamicProperty();
  // testDynamicClass();
  // testDynamicClassList();
  testDynamicStyle();
  // testDynamicStyleList();

  // testDynamicForLoopNode();

  // testDynamicTextNodeWithExpression();

  // testSourceProxy();
  // testSourceProxy2();

}
