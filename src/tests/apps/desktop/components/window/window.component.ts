import { Component } from '../../../../../core/component/component/class/decorator';
import { Template } from '../../../../../core/template/implementation';
import { Style } from '../../../../../core/style/implementation';
import { IComponent } from '../../../../../core/component/component/interfaces';
import { OnCreate, OnDestroy, OnInit } from '../../../../../core/component/component/implements';
import { IComponentContext } from '../../../../../core/component/component/context/interfaces';
import { Activable, CancellableContext, ICancellableContext } from '@lifaon/observables';
import { IDragObject } from '../../../../../misc/drag-observable/types';
import { DragObservable } from '../../../../../misc/drag-observable/implementation';
import { DESKTOP_TEMPLATE_BUILD_OPTIONS } from '../template-build-options';
import { translateService } from '../../../../../side/localization/translate/implementation';
import { Input } from '../../../../../core/component/input/decorator';

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

function AppWindowComponentRegisterResize(instance: AppWindowComponent, horizontalPosition: 'left' | 'center' | 'right', verticalPosition: 'top' | 'center' | 'bottom'): void {
  (instance as any)._cancellableContext.registerActivable(`${ verticalPosition }.${ horizontalPosition }-resize-listener`, () => {
    let elementPositionX: number;
    let elementPositionY: number;

    const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, `:scope > .resize.${ verticalPosition }.${ horizontalPosition }`))
      .on('drag-start', () => {
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
      })
      .on('drag-move', (drag: IDragObject) => {
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
      },
      deactivate(): PromiseLike<void> | void {
        dragObservable.clearObservers();
      }
    });
  });
}

function AppWindowComponentRegisterMove(instance: AppWindowComponent): void {
  (instance as any)._cancellableContext.registerActivable(`window-move-listener`, () => {
    let elementPositionX: number;
    let elementPositionY: number;

    const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, ':scope > .frame > .header'))
      .on('drag-start', () => {
        elementPositionX = instance.left;
        elementPositionY = instance.top;
      })
      .on('drag-move', (drag: IDragObject) => {
        const container: HTMLElement = instance.container;
        const ratioX: number = (drag.delta.x / container.offsetWidth);
        const ratioY: number = (drag.delta.y / container.offsetHeight);
        instance.setLeftKeepingWidth(ratioX + elementPositionX);
        instance.setTopKeepingHeight(ratioY + elementPositionY);
      });

    return new Activable({
      activate(): PromiseLike<void> | void {
      },
      deactivate(): PromiseLike<void> | void {
        dragObservable.clearObservers();
      }
    });
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
  style: Style.fromRelativeURL(import.meta.url, './window.component.css')
})
export class AppWindowComponent extends HTMLElement implements IComponent<IData>, OnCreate<IData>, OnInit, OnDestroy {

  @Input()
  set theme(value: IWindowTheme) {
    console.log('new theme', value);
  }

  protected _cancellableContext: ICancellableContext;
  protected _top: number;
  protected _bottom: number;
  protected _left: number;
  protected _right: number;

  protected context: IComponentContext<IData>;

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

    translateService.setTranslations('en', {
      "window-header-button-minimize": "Minimize",
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
  }

  setRight(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'right', value, force);
  }

  setTop(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'top', value, force);
  }

  setBottom(value: number, force?: boolean) {
    AppWindowComponentSetPosition(this, 'bottom', value, force);
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

  maximize(): void {
    this.setLeft(0, true);
    this.setTop(0, true);
    this.setRight(0, false);
    this.setBottom(0, false);
  }


  onCreate(context: IComponentContext<IData>): void {
    this.context = context;
    this.context.data = {
      // percent: new Source<string>()
    };
  }

  onInit(): void {
    AppWindowComponentRegisterResize(this, 'left', 'top');
    AppWindowComponentRegisterResize(this, 'left', 'center');
    AppWindowComponentRegisterResize(this, 'left', 'bottom');

    AppWindowComponentRegisterResize(this, 'right', 'top');
    AppWindowComponentRegisterResize(this, 'right', 'center');
    AppWindowComponentRegisterResize(this, 'right', 'bottom');

    AppWindowComponentRegisterResize(this, 'center', 'top');
    AppWindowComponentRegisterResize(this, 'center', 'bottom');

    AppWindowComponentRegisterMove(this);
  }

  onDestroy(): void {
    this._cancellableContext.clearAll('destroyed');
  }

  protected normalizePosition() {

  }
}
