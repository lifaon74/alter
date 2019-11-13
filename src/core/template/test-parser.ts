import { parseText } from './generators/text-node-generator/parser';
import { parseStaticAttribute } from './generators/element-node-generator/attribute/static/parser';
import { parseBindAttribute } from './generators/element-node-generator/attribute/bind/parser';
import { parseElementNode } from './generators/element-node-generator/parser';
import { parseCommandAttribute } from './generators/element-node-generator/attribute/commands/parser';
import { parseTemplate } from './generators/template-generator/parser';
import { Template } from './implementation';
import { parseEventListenerAttribute } from './generators/element-node-generator/attribute/event/parser';
import { AttachNode, DestroyNode, DestroyNodeSafe, DetachNode } from '../custom-node/node-state-observable/mutations';
import { NotificationsObserver, Source } from '@lifaon/observables';
import { DEFAULT_PARSERS } from './generators/default';
import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from './helpers';
import { IBindGenerator } from './generators/element-node-generator/attribute/bind/interfaces';
import { ICodeGenerator, ICodeGeneratorOptions } from './generators/code-generator/interfaces';

function generate(generator: ICodeGenerator | null, options?: ICodeGeneratorOptions): void {
  if (generator === null) {
    throw new Error(`Expected generator`);
  } else {
    console.log(generator.generate(options).join('\n'));
  }
}

function testTextParser() {
  const template: string = `a {{ data.b }} c`;
  console.log(parseText(template).map((generator) => generator.generate()).flat().join('\n'));
}

function testStaticAttributeParser() {
  const attr: Attr = document.createAttribute('my-attr');
  attr.value = 'some-value';
  generate(parseStaticAttribute(attr));
}

function testBindPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<a [href]="source"></a>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseBindAttribute(attr, DEFAULT_PARSERS.directives));
}


function testBindClassPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div [class.my-class]="source"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseBindAttribute(attr, DEFAULT_PARSERS.directives));
}

function testBindClassSpreadPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div [class...]="source"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseBindAttribute(attr, DEFAULT_PARSERS.directives));
}

function testBindStylePropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div [style.font-size.px]="source"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseBindAttribute(attr, DEFAULT_PARSERS.directives));
}

function testBindStyleSpreadPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div [style...]="source"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseBindAttribute(attr, DEFAULT_PARSERS.directives));
}

function testIfCommandPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div *if="source"></div>';
  // container.innerHTML = '<div *if-10="source"></div>';
  // container.innerHTML = '<div *if-cache="source"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseCommandAttribute(attr, DEFAULT_PARSERS.commands), { createNode: [''] });
}

function testForCommandPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div *for="let item of items; index as i"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseCommandAttribute(attr, DEFAULT_PARSERS.commands), { createNode: [''] });
}

function testSwitchCommandPropertyParser() {
  const container = document.createElement('div');
  container.innerHTML = ''
    + '<switch *switch="source">'
    // + 'invalid text'
    // + '<invalid-div>invalid</invalid-div>'
    + '<switch-case *switch-case="case1">case1</switch-case>'
    + '<switch-case *switch-case="case2">case2</switch-case>'
    + '<div *switch-default>default</div>'
    + '</switch>';
  generate(parseElementNode(container.firstElementChild as Element, DEFAULT_PARSERS));
}

function testEventListenerParser() {
  const container = document.createElement('div');
  container.innerHTML = '<div (click)="destination"></div>';
  const attr: Attr = (container.firstChild as HTMLElement).attributes[0];
  generate(parseEventListenerAttribute(attr));
}

function testElementParser() {
  const container = document.createElement('div');
  container.innerHTML = `
    <a
    id="my-id"
    [href]="hrefSource"
    [class.my-class]="classSource"
    [class...]="classListSource"
    *if="ifSource"
    >a {{ textSource }} c</a>
  `;
  generate(parseElementNode(container.firstElementChild as Element, DEFAULT_PARSERS));
}

function testTemplateParser() {
  const template: string = `
    <a
    id="my-id"
    [href]="hrefSource"
    [class.my-class]="classSource"
    [class...]="classListSource"
    *if="ifSource"
    >a {{ textSource }} c</a>
  `;
  generate(parseTemplate(template, DEFAULT_PARSERS));
}

function testTemplateBuilder() {

  // const templateString: string = `a {{ data.textSource }} c`;
  // const templateString: string = `a {{{ data.text }}} c`;
  // const templateString: string = `<div id="my-id">hello world!</div>`;
  // const templateString: string = `<a [href]="data.hrefSource">link</a>`;
  // const templateString: string = `<a [$href]="data.href">link</a>`;
  // const templateString: string = `<a [class.my-class]="data.classSource">link</a>`;
  // const templateString: string = `<a [$class.my-class]="data.myClass">link</a>`;
  // const templateString: string = `<a [class...]="data.classListSource">link</a>`;
  // const templateString: string = `<a [$class...]="data.classList">link</a>`;
  // const templateString: string = `<a [style.font-size.px]="data.fontSizeSource">link</a>`;
  const templateString: string = `<a [style...]="data.styleSource">link</a>`;
  // const templateString: string = `<a *if="data.ifSource">link</a>`;
  // const templateString: string = `<a *$if="data.condition">link</a>`;
  // const templateString: string = `<div *for="let item of data.itemsSource; index as i">value: {{ item }}, index: {{ i }}</div>`;
  // const templateString: string = `<div *$for="let item of data.texts; index as i">value: {{{ item }}}, index: {{ i }}</div>`;
  // const templateString: string = `<div (click)="data.onClickObserver">click me</div>`;
  // const templateString: string = `<div ($click)="data.onClick(event)">click me</div>`;
  // const templateString: string = `<container>a {{ data.textSource }} c</container>`;

  // const templateString: string = `
  //   <a
  //   id="my-id"
  //   [href]="data.hrefSource"
  //   [class.my-class]="data.classSource"
  //   [class...]="data.classListSource"
  //   *if="data.ifSource"
  //   (click)="data.onClickObserver"
  //   >a {{ data.textSource }} c</a>
  // `;

  // const templateString: string = `
  //   <a
  //   id="my-id"
  //   [$href]="data.href"
  //   [$class.my-class]="data.myClass"
  //   [$class...]="data.classList"
  //   *$if="data.condition"
  //   ($click)="data.onClick(event)"
  //   >a {{{ data.text }}} c</a>
  // `;

  // const templateString: string = `
  //   <div
  //     *for="let item of data.itemsSource;"
  //     *if="data.ifSource"
  //   >-{{ item }}-</div>
  // `;

  const data = {
    href: 'https://192.168.0.130:1234/',
    myClass: true,
    classList: ['a', 'b'],
    condition: true,
    text: 'hello world!',
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      console.log(event);
    },

    texts: Array.from({ length: 10 }, () => Math.random().toString(10)),
    textSources: Array.from({ length: 10 }, () => new Source<string>()),

    hrefSource: new Source<string>(),
    classSource: new Source<boolean>(),
    fontSizeSource: new Source<number>(),
    styleSource: new Source<any>(),
    classListSource: new Source<string[]>(),
    ifSource: new Source<boolean>(),
    itemsSource: new Source<Source<string>[]>(),
    textSource: new Source<string>(),
    onClickObserver: new NotificationsObserver<'click', MouseEvent>('click', (event: MouseEvent) => {
      event.preventDefault();
      console.log(event);
    }).activate(),
  };

  const template = Template.fromString(templateString, DEFAULT_TEMPLATE_BUILD_OPTIONS);
  template.insert(data, document.body)
    .then(() => {
      (window as any).data = data;
      data.textSource.emit('hello world!');
      data.hrefSource.emit('https://192.168.0.130:1234/');
      data.classSource.emit(true);
      data.classListSource.emit(['a', 'b']);
      data.fontSizeSource.emit(20);
      data.styleSource.emit({ color: 'blue' });

      data.ifSource.emit(true);

      for (const source of data.textSources) {
        source.emit(Math.random().toString(10));
      }

      data.itemsSource.emit(data.textSources);
    });

  (window as any).AttachNode = AttachNode;
  (window as any).DetachNode = DetachNode;
  (window as any).DestroyNode = DestroyNode;
  (window as any).DestroyNodeSafe = DestroyNodeSafe;
  // setTimeout(() => {
  //   DestroyNodeSafe(document.body);
  // }, 10000);
}

export function testParser(): void {
  // testTextParser();
  // testStaticAttributeParser();
  // testBindPropertyParser();
  // testBindClassPropertyParser();
  // testBindClassSpreadPropertyParser();
  // testBindStylePropertyParser();
  // testBindStyleSpreadPropertyParser();
  // testIfCommandPropertyParser();
  testForCommandPropertyParser();
  // testSwitchCommandPropertyParser();
  // testEventListenerParser();
  // testElementParser();
  // testTemplateParser();
  // testTemplateBuilder();

  // testHTMLTemplateError();
}
