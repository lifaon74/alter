import { Component } from '../../../../../core/component/component/class/decorator';
import { Template } from '../../../../../core/template/implementation';
import { Style } from '../../../../../core/style/implementation';
import { IComponent } from '../../../../../core/component/component/interfaces';
import { OnCreate, OnDestroy, OnInit } from '../../../../../core/component/component/implements';
import { IComponentContext } from '../../../../../core/component/component/context/interfaces';
import { CancellableContext, ICancellableContext } from '@lifaon/observables';
import { TAG_FS_TEMPLATE_BUILD_OPTIONS } from '../template-build-options';
import { ITagFileSystemStats } from '../../services/interfaces';


// async function * GetFiles(): Promise<ITagFileSystemStats[]> {
//   return Promise.resolve();
// }

/*---------------------*/


export interface IData {
  // percent: ISource<string>;
}


@Component({
  name: 'app-tag-fs-file-list',
  // @ts-ignore
  template: Template.fromRelativeURL(import.meta.url, './file-list.component.html', TAG_FS_TEMPLATE_BUILD_OPTIONS),
  // @ts-ignore
  style: Style.fromRelativeURL(import.meta.url, './file-list.component.css')
})
export class AppFileListComponent extends HTMLElement implements IComponent<IData>, OnCreate<IData>, OnInit, OnDestroy {

  protected _cancellableContext: ICancellableContext;

  protected context: IComponentContext<IData>;

  constructor() {
    super();
    this._cancellableContext = new CancellableContext();
  }

  onCreate(context: IComponentContext<IData>): void {
    this.context = context;
    this.context.data = {
      // percent: new Source<string>()
    };
  }

  onInit(): void {
  }

  onDestroy(): void {
    this._cancellableContext.clearAll('destroyed');
  }
}
