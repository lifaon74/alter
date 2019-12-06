import { INotification, IObserver, ISource, Observer, Source } from '@lifaon/observables';
import { Component } from '../../../../core/component/component/class/decorator';
import { Template } from '../../../../core/template/implementation';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../../core/template/helpers';
import { IComponent } from '../../../../core/component/component/interfaces';
import { OnCreate } from '../../../../core/component/component/implements';
import { IComponentContext } from '../../../../core/component/component/context/interfaces';
import { TDynamicStyleListValue } from '../../../../core/custom-node/dynamic-node/dynamic-element-node/dynamic-style-list/interfaces';
import { TDynamicClassListValue } from '../../../../core/custom-node/dynamic-node/dynamic-element-node/dynamic-class-list/interfaces';


export interface IData {
  a2: ISource<string>;
  a3: ISource<string>;
  a4: ISource<boolean>;
  a5: ISource<TDynamicClassListValue>;
  a6: ISource<string>;
  a7: ISource<TDynamicStyleListValue>;
  a8: ISource<string>;
  a10: IObserver<INotification<'click', MouseEvent>>;
  a11: ISource<boolean>;
  a12: ISource<ISource<string>[]>;
  a13: ISource<'a' | 'b' | any>;
}


@Component({
  name: 'app-template-syntax-debug',
  template: Template.fromString(`
    <div class="a1">static text</div>
    
    <div class="a2">{{ data.a2 }}</div>
    <div class="a3" [title]="data.a3">dynamic property</div>
    <div class="a4" [class.dynamic-single-class]="data.a4">dynamic single class</div>
    <div class="a5" [class...]="data.a5">dynamic class list</div>
    <div class="a6" [style.color]="data.a6">dynamic style: color</div>
    <div class="a7" [style...]="data.a7">dynamic style list</div>
    <div class="a8" [attr.title]="data.a8">dynamic single attribute</div>
<!--    <div class="a9" [attr.title]="data.a9">dynamic attribute list</div>-->

    <div class="a10" style="user-select: none" (click)="data.a10">observer</div>
    
    <div class="a11" *if="data.a11">IF</div>
    
    <div class="a12">
      <div class="item" *for="let item of data.a12; index as index">#{{ index }}: {{ item }}</div>
    </div>
    
    <div class="a13" *switch="data.a13">
      <div class="switch1" *switch-case="'a'">a</div>
      <div class="switch2" *switch-case="'b'">b</div>
      <div class="switch2" *switch-default>default</div>
    </div>
    
    <div class="test">{{ $string\`\${data.a2} - \${data.a4}\` }}</div>
  `, DEFAULT_TEMPLATE_BUILD_OPTIONS)
})
export class AppTemplateSyntaxDebug extends HTMLElement implements IComponent<IData>, OnCreate<IData> {

  protected context: IComponentContext<IData>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<IData>) {
    function createStringSourceArray(length: number): ISource<string>[] {
      return Array.from({ length }, (v: any, i: number) => new Source<string>().emit(`item ${ i }`));
    }

    this.context = context;
    this.context.data = {
      a2: new Source<string>().emit('dynamic text'),
      a3: new Source<string>().emit('dynamic title'),
      a4: new Source<boolean>().emit(true),
      a5: new Source<TDynamicClassListValue>().emit(['class1', 'class2']),
      a6: new Source<string>().emit('red'),
      a7: new Source<TDynamicStyleListValue>().emit([['color', 'blue'], ['font-size.px', 20]]),
      a8: new Source<string>().emit('dynamic title attribute'),

      a10: new Observer<INotification<'click', MouseEvent>>((notification: INotification<'click', MouseEvent>) => {
        console.log(notification);
      }).activate(),

      a11: new Source<boolean>().emit(true),
      a12: new Source<ISource<string>[]>().emit(createStringSourceArray(10)),
      a13: new Source<'a' | 'b' | any>().emit('a'),
    };


    setInterval(() => {
      this.context.data.a2.emit(`dynamic text: ${ Date.now() }`);
      this.context.data.a3.emit(`dynamic title: ${ Date.now() }`);
      this.context.data.a4.emit(!this.context.data.a4.value);
      this.context.data.a5.emit(['class1', 'class2'].concat(Math.random() < 0.5 ? [] : ['class3']));
      this.context.data.a6.emit(Math.random() < 0.5 ? 'red' : 'green');
      this.context.data.a7.emit([['color', 'blue'], ['font-size.px', Math.round(Math.random() * 10 + 10)]]);
      this.context.data.a8.emit(`dynamic title attribute: ${ Date.now() }`);
      this.context.data.a11.emit(!this.context.data.a11.value);

      const length: number = Math.round(Math.random() * 10 + 10);
      const array: ISource<string>[] = this.context.data.a12.value as ISource<string>[];
      const newArray: ISource<string>[] = (array.length >= length)
        ? array.slice(length)
        : array.concat(createStringSourceArray(length - array.length));
      this.context.data.a12.emit(newArray);

      this.context.data.a13.emit(['a', 'b', 10][Math.floor(Math.random() * 3)]);

    }, 1000);
  }
}
