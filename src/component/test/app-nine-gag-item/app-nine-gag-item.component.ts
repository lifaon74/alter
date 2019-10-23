import { IComponent, IComponentContext } from '../../core/component/interfaces';
import { Component } from '../../core/component/decorator';
import { ISource, Observer, Source } from '@lifaon/observables';
import { Template } from '../../../template/implementation';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../template/helpers';
import { Style } from '../../../style/implementation';
import { Input } from '../../core/input/decorator';


// export type ISourceObject<T> = {
//   [P in keyof T]: ISource<T[P]>;
// };
//
// export function ObjectToSourceObject<T extends object>(object: T): ISourceObject<T> {
//   const newObject: any = {};
//   Object.entries(object).forEach(([key, value]) => {
//     newObject[key] = new Source().emit(value);
//   });
//   return newObject;
// }
//
// export function ArrayToSourceArray<T extends any[]>(array: T): ISourceObject<T> {
//   return array.map((value: any) => {
//     return new Source().emit(value);
//   }) as ISourceObject<T>;
// }
//



export interface INineGagItem {
  mediaType: ISource<'video' | 'photo'>;
  date: ISource<string>;
  sources: string[];
}

@Component({
  name: 'app-nine-gag-item',
  template: Template.fromString(`
    <div class="title">{{ data.item.title }}</div>
    <div class="content">
      <div class="photo" *if="$equal(data.item.type, 'photo')">
        <img [$src]="data.item.sources[0]"/>
      </div>
      <div class="video" *if="$equal(data.item.type, 'video')">
        <video [$src]="data.item.sources[0]" (click)="$scope(data.onClickVideo, node)"/>
      </div>
    </div>
  `, DEFAULT_TEMPLATE_BUILD_OPTIONS),
  // @ts-ignore
  style: Style.fromRelativeURL(import.meta.url, './app-nine-gag-item.component.css')
})
export class AppNineGagItem extends HTMLElement implements IComponent<any> {

  protected context: IComponentContext<any>;

  constructor() {
    super();
  }

  @Input()
  set item(value: INineGagItem) {
    this.context.data.item = value;
  }

  onCreate(context: IComponentContext<any>) {
    this.context = context;
    this.context.data.item = this.item;

    this.context.data.onClickVideo = new Observer<[any, HTMLVideoElement, any]>(([, node]) => {
      if (node.paused) {
        node.play();
      } else {
        node.pause();
      }
    }).activate();
  }
}
