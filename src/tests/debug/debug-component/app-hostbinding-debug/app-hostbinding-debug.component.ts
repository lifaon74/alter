import { Expression, INotification, IObserver, ISource, Observer, Source } from '@lifaon/observables';
import { Component } from '../../../../core/component/component/class/decorator';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../../core/template/helpers';
import { IComponent } from '../../../../core/component/component/interfaces';
import { OnCreate } from '../../../../core/component/component/implements';
import { IComponentContext } from '../../../../core/component/component/context/interfaces';
import { HostBind } from '../../../../core/component/host-binding/decorator';
import { HostBinding } from '../../../../core/component/host-binding/implementation';
import { Style } from '../../../../core/style/implementation';


export interface IData {
}


@Component({
  name: 'app-host-binding-debug',
  style: Style.fromString(`
    :host {
      display: block;
      width: 100px;
      height: 100px;
      background: blue;
    }
  `),
  host: [
    new HostBinding('[class.is-focused]', (node: HTMLElement) => {
      return new Expression(() => document.activeElement === node);
    }, DEFAULT_TEMPLATE_BUILD_OPTIONS)
  ]
})
export class AppHostBindingDebug extends HTMLElement implements IComponent<IData>, OnCreate<IData> {

  // based on a getter => Expression
  @HostBind('[class.a1]', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  get a1(): boolean {
    return this.booleanValue();
  }

  // based on a setter => Observer
  @HostBind('(click)', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  set onClick({ value: event }: INotification<'click', MouseEvent>) {
    console.log('click', event);
  }

  // based on a value different that Observer, Observable or function => Source
  @HostBind('[class.a2]', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  a2: boolean = true;

  // based on a Source
  @HostBind('[class.a3]', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  a3: ISource<boolean> = new Source<boolean>().emit(true);

  // based on a Observer
  @HostBind('(focus)', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  onFocus: IObserver<INotification<'focus', FocusEvent>> = new Observer<INotification<'focus', FocusEvent>>(({ value: event }: INotification<'focus', FocusEvent>) => {
    console.log('focus', event);
  }).activate();

  // based on a method => Observer
  @HostBind('(keydown)', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  onKeyDown({ value: event }: INotification<'keydown', KeyboardEvent>) {
    console.log('keydown', event);
  };

  // based on a function => Observer
  @HostBind('(keyup)', DEFAULT_TEMPLATE_BUILD_OPTIONS)
  onKeyUp = ({ value: event }: INotification<'keyup', KeyboardEvent>) => {
    console.log('keyup', event);
  };

  protected context: IComponentContext<IData>;

  constructor() {
    super();
    this.tabIndex = 1;
  }

  booleanValue(): boolean {
    return Math.floor(Date.now() / 1000) % 2 === 0;
  }

  onCreate(context: IComponentContext<IData>) {
    setInterval(() => {
      this.a2 = this.booleanValue();
      this.a3.emit(this.booleanValue());
    }, 1000);
  }
}
