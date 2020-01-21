import { Component } from '../../../../../core/component/component/class/decorator';
import { Template } from '../../../../../core/template/implementation';
import { Style } from '../../../../../core/style/implementation';
import { IComponent } from '../../../../../core/component/component/interfaces';
import { OnCreate, OnDestroy, OnInit } from '../../../../../core/component/component/implements';
import { IComponentContext } from '../../../../../core/component/component/context/interfaces';
import { CancellableContext, ICancellableContext } from '@lifaon/observables';
import { DESKTOP_TEMPLATE_BUILD_OPTIONS } from '../template-build-options';


/*---------------------*/


export interface IData {
  // percent: ISource<string>;
}


@Component({
  name: 'app-desktop-applications-list',
  // @ts-ignore
  template: Template.fromRelativeURL(import.meta.url, './applications-list.component.html', DESKTOP_TEMPLATE_BUILD_OPTIONS),
  // @ts-ignore
  style: Style.fromRelativeURL(import.meta.url, './applications-list.component.css')
})
export class AppApplicationsListComponent extends HTMLElement implements IComponent<IData>, OnCreate<IData>, OnInit, OnDestroy {

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
