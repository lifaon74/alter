import { templateFromString as TemplateFromString } from '../template/implementation';
import { Attribute, CustomElement } from './core/custom-element/implementation';
import { IComponent, IComponentContext, OnDestroy, OnInit } from './core/component/interfaces';
import { NodeStateObservable } from '../custom-node/node-state-observable/implementation';
import { styleFromString as StyleFromString } from '../style/implementation';
import { Router } from './router/implementation';
import { IRoute } from './router/route/interfaces';
import { Route } from './router/route/implementation';
import { translateService } from '../localization/translate/implementation';
import { INotification, IObserver, ISource, Observer, Source } from '@lifaon/observables/public';
import { HostBinding } from './core/host-binding/implementation';
import { Component } from './core/component/decorator';
import { HostBind } from './core/host-binding/decorator';
import { AppNineGagItem } from './test/app-nine-gag-item/app-nine-gag-item.component';
import { AppItemList } from './test/app-item-list/app-item-list.component';

function getFetchProxyURL(url: string): string {
  // return 'https://bypasscors.herokuapp.com/api/?url=' + encodeURIComponent(url);
  return 'http://localhost:1337/?url=' + encodeURIComponent(url);
}

function fetchProxy(input: RequestInfo, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string') {
    input = getFetchProxyURL(input);
  } else {
    input = new Request(Object.assign({}, input, { url: getFetchProxyURL(input.url) }));
  }

  return fetch(input, init);
}


/*------------------------------------*/


// https://9gag.com/v1/group-posts/group/default/type/hot?after=aB0Lwz1%2CaE2Vnmo%2CamBGr76&c=10

@Component({
  name: 'app-home',
  template: TemplateFromString(`
    <!--<div>{{ data.greetings }}</div>-->
    <!--<div>{{ data.date }}</div>-->
  <!--    <app-nine-gag/>-->

  `),
  style: StyleFromString(`
    :host {
      display: block;
    }
  `)
})
class AppHome extends HTMLElement implements IComponent<any> {
  protected _timer: IObserver<void>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<any>) {
    console.log('create home');
    // context.data.greetings = $translate('translate.greetings');
    // context.data.date = new DateFormatSource();
    //
    // this._timer = new TimerObservable(50)
    //   .pipeTo(() => {
    //     context.data.date.emit(Date.now(), {
    //       year: 'numeric', month: 'numeric', day: 'numeric',
    //       hour: 'numeric', minute: 'numeric', second: 'numeric',
    //       hour12: false
    //     });
    //   }).activate();
  }

  onInit() {
    console.log('on init home');

    translateService.setLocale('en');
    translateService.setTranslations('en', {
      'translate.greetings': 'Welcome to the home page'
    });
  }

  onDestroy() {
    this._timer.deactivate();
    console.log('on destroy home');
  }

}



interface IItem {
  type: string;
}

@Component({
  name: 'app-nine-gag',
  template: TemplateFromString(`
<!--    <span>{{ $translate('name') }}</span>-->
    <div class="item" *for="let item of data.items">
      {{ item.type }}
    </div>
  `),
  style: StyleFromString(`
    :host {
      display: block;
    }
    
    :host > .item {
      display: block;
      width: 400px;
    }
  `)
})
class AppNineGag extends HTMLElement implements IComponent<any> {
  protected context: IComponentContext<any>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<any>) {
    console.log('create !!!!');
    this.context = context;
    this.context.data.items = new Source<IItem[]>().emit([]);
    console.log('on create app nine');
  }

  onInit() {
    console.log('on init app nine');
    this.loadMore();
  }

  onDestroy() {
    console.log('on destroy app nine');
  }

  protected loadMore() {
    fetchProxy('https://9gag.com/v1/group-posts/group/default/type/hot')
      .then(_ => _.json())
      .then((data: any) => {
        console.log(data);

        this.context.data.items.emit(
          this.context.data.items.value.concat(
            data.data.posts.map((post: any) => {
              return {
                type: '9gag',
                data: post,
              };
            })
          )
        );
      });
  }
}





@Component({
  name: 'app-users',
  template: TemplateFromString(`
    users page
    <router/>
  `),
  style: StyleFromString(`
    :host {
      display: block;
    }
  `)
})
class AppUsers extends HTMLElement implements IComponent<any> {
  constructor() {
    super();
  }

  onInit() {
    console.log('on init users');
  }

  onDestroy() {
    console.log('on destroy users');
  }
}


@Component({
  name: 'app-user',
  template: TemplateFromString(`
    user page
  `),
  style: StyleFromString(`
    :host {
      display: block;
    }
  `)
})
class AppUser extends HTMLElement implements IComponent<any>, OnInit, OnDestroy {
  constructor() {
    super();
  }

  onInit() {
    console.log('on init user');
  }

  onDestroy() {
    console.log('on destroy user');
  }
}

/*------------------------------------*/


function testCustomElement() {

  @CustomElement({ name: 'app-ce-input' })
  class AppCEInput extends HTMLElement {

    static get observedAttributes() {
      return ['open'];
    }

    @Attribute({ type: 'boolean'})
    public disabled: boolean;

    constructor() {
      super();
      console.log('created');
      this.disabled = true;

      console.log(AppCEInput.observedAttributes);
    }

    connectedCallback(): void {
      this.innerHTML = `<span>hello world !</span>`;
      console.log('enter dom');
    }

    disconnectedCallback(): void {
      console.log('leave dom');
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      console.log('change');
    }
  }

  document.body.innerHTML = `
    <app-ce-input disabled>a</app-ce-input>
  `;
}

function testAlterComponent1() {

  @Component({
    name: 'app-switch-input',
    template: TemplateFromString(`
    <div class="my-div">
      {{ data.text }}
    </div>
  `),
    style: StyleFromString(`
    :host {
      display: block;
      background-color: #aaa;
    }
  `)
  })
  class AppInput extends HTMLElement implements IComponent<any>, OnInit {
    public readonly context: IComponentContext<any>;

    @Attribute({ type: 'boolean' })
    public value: boolean;

    constructor(context: IComponentContext<any>) {
      super();
      this.context = context;

      Object.assign(this.context.data, {
        text: new Source<string>().emit('hello world!'),
      });

      // this.context.attributeListener
      //   .on('value', (change: any) => {
      //     console.log(change);
      //   });
    }

    onInit(): void {
      console.log('init');
    }
  }


  document.body.innerHTML = `
    <app-switch-input></app-switch-input>
  `;
}

async function testRouter() {
  document.body.innerHTML = `
    <router/>
  `;

  const routes: IRoute[] = [
    new Route({
      path: '/',
      component: 'app-home'
    }),
    new Route({
      path: '/user',
      component: 'app-users',
      children: [
        new Route({
          path: '/:id',
          component: 'app-user',
          // redirectTo: '/home/:id'
        }),
      ]
    }),
    // new Route({
    //   path: '/user/:id',
    //   component: 'app-user',
    //   children: [
    //     new Route({
    //       path: '/edit',
    //       component: 'user-edit-page'
    //     }),
    //   ]
    // }),
    new Route({
      path: '**',
      component: 'app-not-found',
    }),
  ];

  const router = new Router(routes);

  await router.navigate('/');
  // await router.navigate('/user/24');
  // console.log('navigated !');

  console.log(router.getParams());

  (window as any).router = router;
// console.log(Router.resolve('/user/10/edit'));
}

function testStyle() {
  const css: string = `
    body, html {
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100%;
    }

    :host {
      background-color: #fafafa;
    }

    :host:hover {
      background-color: #fff;
    }
  `;

  // const css: string = `
  //   div[--element='{"minWidth": 300}'] a {
  //     color: red;
  //   }
  // `;

  // const css: string = `
  //   input[--element], div[--element='[{"minWidth": [2]}]'], a[--element='{"maxWidth": 300}'] {
  //     width: 100px;
  //     height: 100px;
  //     border-color: limegreen;
  //   }
  // `;

  document.body.innerHTML = `
    <div>
      <a>link</a>
    </div>
  `;

  function callback(element: HTMLElement, name: string, args: any) {
    // console.log(name, args);
    return element.offsetWidth > 300;
  }

  const style = StyleFromString(css);
  style.insert(document.body);

  document.body.appendChild(new Text('hello'));

}


function testHostBinding() {

  @Component({
    name: 'app-test-host-binding',
    template: TemplateFromString(``),
    style: StyleFromString(`
    :host {
      display: block;
    }
  `),
    host: [
      new HostBinding('[attr.static]', () => 'value-static')
    ]
  })
  class AppTestHostBinding extends HTMLTextAreaElement implements IComponent<any> {
    protected context: IComponentContext<any>;


    @HostBind('[class...]')
    get className(): string {
      // return 'class-' + Math.floor(Math.random() * 1e15).toString(16);
      return 'class-' + Math.floor(Date.now() / 1000);
    }

    @HostBind('[attr.attr-a]')
    public attrA: string;

    @HostBind('[attr.attr-b]')
    public attrB: ISource<string>;


    @HostBind('(click)')
    set onClick(notification: INotification<'click', MouseEvent>) {
      console.log('click', notification);
    }

    @HostBind('(focus)')
    public onFocus: IObserver<INotification<'focus', FocusEvent>>;

    constructor() {
      super();
      console.log('construct');
    }

    @HostBind('(keydown)')
    onKeyDown(notification: INotification<'keydown', KeyboardEvent>) {
      console.log('keydown', notification);
    }

    onCreate(context: IComponentContext<any>) {
      this.attrA = 'value-a1';
      this.attrA = 'value-a2';

      this.attrB = new Source<string>().emit('value-b1');

      this.onFocus = new Observer<INotification<'focus', FocusEvent>>((notification: INotification<'focus', FocusEvent>) => {
        console.log('focus', notification);
      }).activate();
    }
  }

  document.body.innerHTML = `
    <textarea is="app-test-host-binding">awdawd</textarea>
  `;
}

function test9GagPage(){
  document.body.innerHTML = `
    <app-nine-gag/>
  `;
}

function testAppItemList() {
  const module = [
    AppItemList,
    AppNineGagItem
  ];


  document.body.innerHTML = `
    <app-item-list/>
  `;
}

export function testComponent() {
  NodeStateObservable.useDOMObserver = false;

  // testCustomElement();
  // testAlterComponent1();
  // testRouter();
  // testStyle();
  // testNavigation();
  // testQueryParamsChange();
  // testTranslateService();
  // testTranslateSource();

  // testInfiniteScroller();
  // testSwipeObservable();
  // testHostBinding();
  // test9GagPage();

  testAppItemList();

}
