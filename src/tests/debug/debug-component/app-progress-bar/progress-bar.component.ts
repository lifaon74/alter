import { ISource, Source } from '@lifaon/observables';
import { Component } from '../../../../core/component/component/class/decorator';
import { Template } from '../../../../core/template/implementation';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../../core/template/helpers';
import { Style } from '../../../../core/style/implementation';
import { IComponent } from '../../../../core/component/component/interfaces';
import { OnCreate } from '../../../../core/component/component/implements';
import { IComponentContext } from '../../../../core/component/component/context/interfaces';
import { IAttributeChange } from '../../../../core/component/component/context/types';
import { Input, TInput } from '../../../../core/component/input/decorator';


export interface IData {
  percent: ISource<string>;
}

/**
 * Example using simple template and simple style
 * - reflects both the 'ratio' property and attribute on its state
 */
@Component({
  name: 'app-progress-bar',
  template: Template.fromString(`
    <div
    class="progress"
    [style.width]="data.percent"
    >{{ data.percent }}</div>
  `, DEFAULT_TEMPLATE_BUILD_OPTIONS),
  style: Style.fromString(`
    :host {
      display: block;
      width: 100%;
      height: 20px;
    }
    
    :host > .progress {
      height: 100%;
      background-color: blue;
      transition: width 500ms;
    }
  `)
})
export class AppProgressBar extends HTMLElement implements IComponent<IData>, OnCreate<IData> {

  static get observedAttributes() {
    return ['ratio'];
  }

  @Input((value: number, instance: AppProgressBar) => {
    instance.setAttribute('ratio', value.toString(10));
    instance.context.data.percent.emit(`${ Math.round(value * 100) }%`);
  })
  ratio: TInput<number>;

  protected context: IComponentContext<IData>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<IData>): void {
    this.context = context;
    this.context.data = {
      percent: new Source<string>()
    };
    this.ratio = 0.5;

    this.context.attributeListener
      .addListener('ratio', ({ current }: IAttributeChange<string>) => {
        const ratio: number = parseFloat(current);
        if (ratio !== this.ratio) {
          this.ratio = ratio;
        }
      }).activate();
  }
}
