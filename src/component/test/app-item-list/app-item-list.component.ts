import { IComponent, IComponentContext, OnDestroy, OnDisconnected } from '../../core/component/interfaces';
import { Component } from '../../core/component/decorator';

import { IObservable, IObserver, IsObservable, ISource, Source } from '@lifaon/observables';
import { Template } from '../../../template/implementation';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../template/helpers';
import { Style } from '../../../style/implementation';
import { INineGagItem } from '../app-nine-gag-item/app-nine-gag-item.component';
import { Input } from '../../core/input/decorator';

// export interface ISwitchData {
//   value: ISource<any>;
// }
//
// @Component({
//   name: 'app-switch',
//   template: Template.fromString(`
//     {{ data.value }}
//   `, DEFAULT_TEMPLATE_BUILD_OPTIONS),
// })
// export class AppSwitch extends HTMLElement implements IComponent<ISwitchData> {
//
//   protected context: IComponentContext<ISwitchData>;
//   protected valueObserver: IObserver<any> | null;
//
//   constructor() {
//     super();
//     this.valueObserver = null;
//   }
//
//   // INFO maybe create an @Input for this case
//   get value(): any {
//     return this.context.data.value.value;
//   }
//
//   set value(value: any) {
//     if (this.valueObserver !== null) {
//       this.valueObserver.deactivate();
//       this.valueObserver = null;
//     }
//
//     if (IsObservable(value)) {
//       this.valueObserver = value.pipeTo((value: any) => {
//         this.context.data.value.emit(value);
//       }).activate();
//     } else {
//       this.context.data.value.emit(value);
//     }
//   }
//
//   onCreate(context: IComponentContext<ISwitchData>) {
//     this.context = context;
//     this.context.data = {
//       value: new Source<any>()
//     };
//   }
//
// }


// export interface ISwitchData {
//   value: ISource<any>;
// }
//
// @Component({
//   name: 'app-switch',
//   template: Template.fromString(`
//     {{ data.value }}
//   `, DEFAULT_TEMPLATE_BUILD_OPTIONS),
// })
// export class AppSwitch extends HTMLElement implements IComponent<ISwitchData> {
//
//   protected context: IComponentContext<ISwitchData>;
//
//   constructor() {
//     super();
//   }
//
//   @Input()
//   get value(): any {
//     return this.context.data.value.value;
//   }
//
//   set value(value: any) {
//     this.context.data.value.emit(value);
//   }
//
//   onCreate(context: IComponentContext<ISwitchData>) {
//     this.context = context;
//     this.context.data = {
//       value: new Source<any>()
//     };
//   }
//
// }

/*---------------------------------------*/

function getFetchProxyURL(url: string): string {
  return `https://cors-anywhere.herokuapp.com/${ url }`;
  // return 'https://bypasscors.herokuapp.com/api/?url=' + encodeURIComponent(url);
  // return 'http://localhost:1337/?url=' + encodeURIComponent(url);
}

function fetchProxy(input: RequestInfo, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string') {
    input = getFetchProxyURL(input);
  } else {
    input = new Request(Object.assign({}, input, { url: getFetchProxyURL(input.url) }));
  }

  return fetch(input, init);
}



export interface IItem {
  type: ISource<string>;
}

export interface IMediaItem {
  mediaType: ISource<'video' | 'photo'>;
  date: ISource<number>;
  sources: string[];
}

export interface IData {
  items: ISource<IItem[]>;
}

@Component({
  name: 'app-item-list',
  template: Template.fromString(`
    <container *for="let item of data.items" *switch="item.type">
<!--      <app-nine-gag-item *switch-case="'9gag'">9gag</app-nine-gag-item>-->
      <div *switch-default>default</div>
    </container>
  `, DEFAULT_TEMPLATE_BUILD_OPTIONS),
  // @ts-ignore
  style: Style.fromRelativeURL(import.meta.url, './app-item-list.component.css')
})
export class AppItemList extends HTMLElement implements IComponent<IData>, OnDisconnected {
  protected context: IComponentContext<IData>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<IData>) {
    this.context = context;
    this.context.data = {
      items: new Source<IItem[]>().emit([])
    };

    this.loadMore();
  }

  onConnected() {
    console.log('connected');
  }

  onDisconnected() {
    console.log('disconnected');
  }

  protected loadMore() {
    this.context.data.items.emit(
      this.context.data.items.value.concat(
        [0, 1, 2].map((post: any) => {
          return {
            type: new Source<string>().emit('9gag'),
          };
        })
      )
    );

    // fetchProxy('https://9gag.com/v1/group-posts/group/default/type/hot')
    //   .then(_ => _.json())
    //   .then((data: any) => {
    //     console.log(data);
    //
    //     this.context.data.items.emit(
    //       this.context.data.items.value.concat(
    //         data.data.posts.map((post: any) => {
    //           return {
    //             type: new Source<string>().emit('9gag'),
    //           };
    //         })
    //       )
    //     );
    //   });
  }
}
