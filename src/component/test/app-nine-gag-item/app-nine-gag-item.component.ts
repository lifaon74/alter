import { Component, IComponent, IComponentContext } from '../../Component';
import { templateFromString as TemplateFromString } from '../../../template/implementation';
import { styleFromString as StyleFromString, styleFromURL as StyleFromURL } from '../../../style/implementation';
import { ISource, Source, Observer } from '@lifaon/observables/public';



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



interface INineGagItem {
  type: ISource<'video' | 'photo'>;
  date: ISource<string>;
  sources: string[];
}

@Component({
  name: 'app-nine-gag-item',
  template: TemplateFromString(`
    <div class="title">{{ data.item.title }}</div>
    <div class="content">
      <div class="photo" *if="$equal(data.item.type, 'photo')">
        <img [$src]="data.item.sources[0]"/>
      </div>
      <div class="video" *if="$equal(data.item.type, 'video')">
        <video [$src]="data.item.sources[0]" (click)="$scope(data.onClickVideo, node)"/>
      </div>
    </div>
  `),
  style: StyleFromURL('./app-nine-gag-item.component.css')
})
class AppNineGagItem extends HTMLElement implements IComponent {

  public item: ISource<INineGagItem>;

  protected context: IComponentContext;

  constructor() {
    super();
    this.item = new Source();
  }

  onCreate(context: IComponentContext) {
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
