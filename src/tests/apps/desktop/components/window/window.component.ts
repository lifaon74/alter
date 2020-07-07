import { Component } from '../../../../../core/component/component/class/decorator';
import { Template } from '../../../../../core/template/implementation';
import { Style } from '../../../../../core/style/implementation';
import { IComponent } from '../../../../../core/component/component/interfaces';
import { OnCreate, OnDestroy, OnInit } from '../../../../../core/component/component/implements';
import { IComponentContext } from '../../../../../core/component/component/context/interfaces';
import {
  Activable, CancellableContext, IActivable, ICancellableContext, IObserver, ISource, Observer, Source
} from '@lifaon/observables';
import { IDragObject } from '../../../../../misc/drag-observable/types';
import { DragObservable } from '../../../../../misc/drag-observable/implementation';
import { DESKTOP_TEMPLATE_BUILD_OPTIONS } from '../template-build-options';
import { Output, TOutput } from '../../../../../core/component/ouput/decorator';
import { Input, TInput } from '../../../../../core/component/input/decorator';
import { DESKTOP_STYLE_BUILD_OPTIONS } from '../style-build-options';
import { LoadService } from '../../../../../core/services/services-loader';
import { TranslateService } from '../../../../../side/localization/translate/implementation';

/***
 * TODO:
 * - think about the maximize and minimize state => is there a better pattern ?
 * - think about the tabs mechanism
 */

// function NormalizePosition(
//   position: number,
//   oppositePosition: number,
//   minSpacing: number
// ): number {
//   return Math.min(position, 1 - oppositePosition - minSpacing);
// }

type TPositionOrigin = 'left' | 'right' | 'top' | 'bottom';

function GetOppositePositionOrigin(origin: TPositionOrigin): TPositionOrigin {
  switch (origin) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    default:
      throw new TypeError(`Expected TPositionOrigin as origin`);
  }
}


/*---------------------*/

function QuerySelectorOrThrow<E extends Element>(target: Element, selector: string): E {
  const element: E | null = target.querySelector<E>(selector);
  if (element === null) {
    throw new Error(`QuerySelector failed to retrieve: '${ selector }'`);
  } else {
    return element;
  }
}

function ParentElementOrThrow<E extends Element>(target: Element): E {
  if (target.parentElement === null) {
    throw new Error(`Element <${ target.tagName }> should have a parent element`);
  } else {
    return target.parentElement as Element as E;
  }
}

function IsSafeIntegerOrThrow(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Expected integer as value`);
  }
}

function IsFiniteNumberOrThrow(value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Expected finite number as value`);
  }
}

/*---------------------*/

function AppWindowComponentCreateResizeActivable(
  instance: AppWindowComponent,
  horizontalPosition: 'left' | 'center' | 'right',
  verticalPosition: 'top' | 'center' | 'bottom'
): IActivable {
  let elementPositionX: number;
  let elementPositionY: number;

  const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, `:scope > .resize.${ verticalPosition }.${ horizontalPosition }`));

  const dragStartObserver = dragObservable
    .addListener('drag-start', () => {
      elementPositionX = (horizontalPosition === 'left')
        ? instance.left
        : (
          (horizontalPosition === 'center')
            ? 0
            : instance.right
        );
      elementPositionY = (verticalPosition === 'top')
        ? instance.top
        : (
          (verticalPosition === 'center')
            ? 0
            : instance.bottom
        );
    });

  const dragMoveObserver = dragObservable
    .addListener('drag-move', (drag: IDragObject) => {
      const container: HTMLElement = instance.container;
      const ratioX: number = (drag.delta.x / container.offsetWidth);
      const ratioY: number = (drag.delta.y / container.offsetHeight);

      if (horizontalPosition === 'left') {
        instance.setLeft(ratioX + elementPositionX, false);
      } else if (horizontalPosition === 'right') {
        instance.setRight(-ratioX + elementPositionX, false);
      }

      if (verticalPosition === 'top') {
        instance.setTop(ratioY + elementPositionY, false);
      } else if (verticalPosition === 'bottom') {
        instance.setBottom(-ratioY + elementPositionY, false);
      }
    });

  return new Activable({
    activate(): PromiseLike<void> | void {
      dragStartObserver.activate();
      dragMoveObserver.activate();
    },
    deactivate(): PromiseLike<void> | void {
      dragStartObserver.deactivate();
      dragMoveObserver.deactivate();
    }
  });
}

function AppWindowComponentCreateAllResizeActivable(instance: AppWindowComponent) {
  const activables: IActivable [] = [
    AppWindowComponentCreateResizeActivable(instance, 'left', 'top'),
    AppWindowComponentCreateResizeActivable(instance, 'left', 'center'),
    AppWindowComponentCreateResizeActivable(instance, 'left', 'bottom'),

    AppWindowComponentCreateResizeActivable(instance, 'right', 'top'),
    AppWindowComponentCreateResizeActivable(instance, 'right', 'center'),
    AppWindowComponentCreateResizeActivable(instance, 'right', 'bottom'),

    AppWindowComponentCreateResizeActivable(instance, 'center', 'top'),
    AppWindowComponentCreateResizeActivable(instance, 'center', 'bottom'),
  ];

  return new Activable({
    activate(): PromiseLike<void> | void {
      return Promise.all(activables.map((activable: IActivable) => activable.activate())).then(() => {});
    },
    deactivate(): PromiseLike<void> | void {
      return Promise.all(activables.map((activable: IActivable) => activable.deactivate())).then(() => {});
    }
  });
}

function AppWindowComponentCreateMoveActivable(instance: AppWindowComponent): IActivable {
  let elementPositionX: number;
  let elementPositionY: number;

  const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, ':scope > .frame > .header'));

  const dragStartObserver = dragObservable
    .addListener('drag-start', () => {
      elementPositionX = instance.left;
      elementPositionY = instance.top;
    });

  const dragMoveObserver = dragObservable
    .addListener('drag-move', (drag: IDragObject) => {
      const container: HTMLElement = instance.container;
      const ratioX: number = (drag.delta.x / container.offsetWidth);
      const ratioY: number = (drag.delta.y / container.offsetHeight);
      instance.setLeftKeepingWidth(ratioX + elementPositionX);
      instance.setTopKeepingHeight(ratioY + elementPositionY);
    });

  return new Activable({
    activate(): PromiseLike<void> | void {
      dragStartObserver.activate();
      dragMoveObserver.activate();
    },
    deactivate(): PromiseLike<void> | void {
      dragStartObserver.deactivate();
      dragMoveObserver.deactivate();
    }
  });
}


/*---------------------*/

function AppWindowComponentSetInternalPosition(
  instance: AppWindowComponent,
  origin: TPositionOrigin,
  value: number,
): void {
  if (value !== instance[`_${ origin }`]) {
    instance[`_${ origin }`] = value;
    instance.style.setProperty(origin, `${ value * 100 }%`);
  }
}

export function AppWindowComponentSetPosition(
  instance: AppWindowComponent,
  origin: TPositionOrigin,
  value: number,
  force: boolean = true,
  minSpacing: number = 0.1
): void {
  IsFiniteNumberOrThrow(value);
  const oppositeOrigin: TPositionOrigin = GetOppositePositionOrigin(origin);
  let _value: number;
  if (force) {
    _value = value;
    AppWindowComponentSetInternalPosition(instance, oppositeOrigin, Math.min(instance[oppositeOrigin], 1 - _value - minSpacing));
  } else {
    _value = Math.min(value, 1 - instance[oppositeOrigin] - minSpacing);
  }
  AppWindowComponentSetInternalPosition(instance, origin, _value);
}

/*---------------------*/


export interface IData {
  // percent: ISource<string>;
  isMaximized: ISource<boolean>;
  enableMaximize: ISource<boolean>;
  onClickMaximizeButton: IObserver<MouseEvent>;
  onClickReduceButton: IObserver<MouseEvent>;
  onClickCloseButton: IObserver<MouseEvent>;
}

export interface IWindowTheme {
  header?: {
    backgroundColor?: string;
  },
  content?: {
    backgroundColor?: string;
  },
}


@Component({
  name: 'app-desktop-window',
  // @ts-ignore
  template: Template.fromRelativeURL(import.meta.url, './window.component.html', DESKTOP_TEMPLATE_BUILD_OPTIONS),
  // @ts-ignore
  style: Style.fromRelativeURL(import.meta.url, './window.component.css', DESKTOP_STYLE_BUILD_OPTIONS)
})
export class AppWindowComponent extends HTMLElement implements IComponent<IData>, OnCreate<IData>, OnInit, OnDestroy {

  @Input((value: IWindowTheme, instance: AppWindowComponent) => {
    console.log('new theme', value);
  })
  theme: TInput<IWindowTheme>;

  @Output()
  emitMaximize: TOutput<void>;

  protected _cancellableContext: ICancellableContext;
  protected _top: number;
  protected _bottom: number;
  protected _left: number;
  protected _right: number;

  protected context: IComponentContext<IData>;
  protected _allResizeActivable: IActivable;
  protected _moveActivable: IActivable;

  constructor() {
    super();
    this._cancellableContext = new CancellableContext();
    this._top = 0;
    this._bottom = 0;
    this._left = 0;
    this._right = 0;

    this.animations = false;
    this.setLeft(0.1, true);
    this.setTop(0.1, true);
    this.setRight(0.1, false);
    this.setBottom(0.1, false);

    const translateService = LoadService(TranslateService);

    translateService.setTranslations('en', {
      'window.header.button.minimize': 'Minimize',
      'window.header.button.maximize': 'Maximize',
      'window.header.button.reduce': 'Reduce',
      'window.header.button.close': 'Close',
    });

    translateService.setLocale('en');

    (window as any).w = this;
  }

  get left(): number {
    return this._left;
  }

  get right(): number {
    return this._right;
  }

  get top(): number {
    return this._top;
  }

  get bottom(): number {
    return this._bottom;
  }

  get width(): number {
    return 1 - this._left - this._right;
  }

  get height(): number {
    return 1 - this._top - this._bottom;
  }

  get animations(): boolean {
    return this.classList.contains('animations-enabled');
  }

  set animations(value: boolean) {
    this.classList.toggle('animations-enabled', value);
  }

  get container(): HTMLElement {
    return ParentElementOrThrow(this);
  }

  get isMaximized(): boolean {
    return (this._left === 0)
      && (this._right === 0)
      && (this._top === 0)
      && (this._bottom === 0);
  }


  setLeft(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'left', value, force);
    this.refreshIsMaximized();
  }

  setRight(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'right', value, force);
    this.refreshIsMaximized();
  }

  setTop(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'top', value, force);
    this.refreshIsMaximized();
  }

  setBottom(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'bottom', value, force);
    this.refreshIsMaximized();
  }


  setWidthFromLeft(value: number): void {
    this.setRight(1 - this._left - value, false);
  }

  setWidthFromRight(value: number): void {
    this.setLeft(1 - this._right - value, false);
  }

  setHeightFromTop(value: number): void {
    this.setBottom(1 - this._top - value, false);
  }

  setHeightFromBottom(value: number): void {
    this.setTop(1 - this._bottom - value, false);
  }


  setLeftKeepingWidth(value: number): void {
    const width: number = this.width;
    this.setLeft(value, true);
    this.setWidthFromLeft(width);
  }

  setRightKeepingWidth(value: number): void {
    const width: number = this.width;
    this.setRight(value, true);
    this.setWidthFromRight(width);
  }

  setTopKeepingHeight(value: number): void {
    const height: number = this.height;
    this.setTop(value, true);
    this.setHeightFromTop(height);
  }

  setBottomKeepingHeight(value: number): void {
    const height: number = this.height;
    this.setBottom(value, true);
    this.setHeightFromBottom(height);
  }


  uniformResize(position: number = 0): void {
    this.setLeft(position, true);
    this.setTop(position, true);
    this.setRight(position, false);
    this.setBottom(position, false);
  }

  onCreate(context: IComponentContext<IData>): void {
    this.context = context;
    this.context.data = {
      isMaximized: new Source<boolean>().emit(this.isMaximized),
      enableMaximize: new Source<boolean>().emit(false),
      onClickMaximizeButton: new Observer<MouseEvent>(() => {
        this.uniformResize(0);
      }).activate(),
      onClickReduceButton: new Observer<MouseEvent>(() => {
        this.uniformResize(0.2);
      }).activate(),
      onClickCloseButton: new Observer<MouseEvent>(() => {
        console.log('close');
      }).activate(),
      // percent: new Source<string>()
    };
  }

  onInit(): void {
    this._allResizeActivable = AppWindowComponentCreateAllResizeActivable(this);
    this._moveActivable = AppWindowComponentCreateMoveActivable(this);
  }

  onDestroy(): void {
    this._cancellableContext.clearAll('destroyed');
  }


  protected refreshIsMaximized(): void {
    if (this.context) {
      this.context.data.isMaximized.emit(this.isMaximized);
    }
  }
}
