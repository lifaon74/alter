import { IComponent, IComponentContext } from '../../core/component/interfaces';
import { Component } from '../../core/component/decorator';
import { templateFromString } from '../../../template/implementation';
import { styleFromRelativeURL } from '../../../style/implementation';
import { ISource, Source } from '@lifaon/observables/public';


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
  template: templateFromString(`
    <container *for="let item of data.items">
       list
    </container>
  `),
  // @ts-ignore
  style: styleFromRelativeURL(import.meta.url, './app-item-list.component.css')
})
export class AppItemList extends HTMLElement implements IComponent<IData> {
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


  protected loadMore() {
    fetchProxy('https://9gag.com/v1/group-posts/group/default/type/hot')
      .then(_ => _.json())
      .then((data: any) => {
        console.log(data);

        this.context.data.items.emit(
          this.context.data.items.value.concat(
            data.data.posts.map((post: any) => {
              return {
                type: new Source<string>().emit('9gag'),
                // data: post,
              };
            })
          )
        );
      });
  }
}
