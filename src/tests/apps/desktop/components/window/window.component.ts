import { Component } from '../../../../../core/component/component/class/decorator';
import { Template } from '../../../../../core/template/implementation';
import { Style } from '../../../../../core/style/implementation';
import { IComponent } from '../../../../../core/component/component/interfaces';
import { OnCreate, OnDestroy, OnInit } from '../../../../../core/component/component/implements';
import { IComponentContext } from '../../../../../core/component/component/context/interfaces';
import {
  Activable, CancellableContext, IActivable, ICancellableContext, IObserver, ISource, Observer, Source,
  EventsObservable, IObservable, $and, $equal, IObservableContext, DistinctValueObservable, CreateObservableEmitter,
  IDistinctValueObservable, IDistinctValueObservableContext, IDistinctValueObservableTypedConstructor,
  FunctionObservable, IFunctionObservable, CreateDistinctObservableEmitter, ReadDistinctValueObservable
} from '@lifaon/observables';
import { IDragObject } from '../../../../../misc/drag-observable/types';
import { DragObservable } from '../../../../../misc/drag-observable/implementation';
import { DESKTOP_TEMPLATE_BUILD_OPTIONS } from '../template-build-options';
import { Output, TOutput } from '../../../../../core/component/ouput/decorator';
import { DESKTOP_STYLE_BUILD_OPTIONS } from '../style-build-options';
import { LoadService } from '../../../../../core/services/services-loader';
import { TranslateService } from '../../../../../side/localization/translate/implementation';
import { HostBind } from '../../../../../core/component/host-binding/decorator';


// export function $distinctObservable<G>(value?: G) {
//   const result = CreateObservableEmitter<IDistinctValueObservableTypedConstructor<G>>(DistinctValueObservable);
//   if (value !== void 0) {
//     result[1].emit(value);
//   }
//   return result;
// }
//
// export function value$<G>(observable: IObservable<G>): G {
//   let value: G;
//   observable
//     .pipeTo((_value: G) => {
//       value = _value;
//     })
//     .activate()
//     .deactivate();
//   // @ts-ignore
//   return value;
// }

/*----------------------*/

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

  const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, `:scope > .resize-container > .resize.${ verticalPosition }.${ horizontalPosition }`));

  const dragStartObserver = dragObservable
    .addListener('drag-start', () => {
      elementPositionX = (horizontalPosition === 'left')
        ? ReadDistinctValueObservable(instance.$left)
        : (
          (horizontalPosition === 'center')
            ? 0
            : ReadDistinctValueObservable(instance.$right)
        );
      elementPositionY = (verticalPosition === 'top')
        ? ReadDistinctValueObservable(instance.$top)
        : (
          (verticalPosition === 'center')
            ? 0
            : ReadDistinctValueObservable(instance.$bottom)
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
      return Promise.all(activables.map((activable: IActivable) => activable.activate())).then(() => {
      });
    },
    deactivate(): PromiseLike<void> | void {
      return Promise.all(activables.map((activable: IActivable) => activable.deactivate())).then(() => {
      });
    }
  });
}

function AppWindowComponentCreateMoveActivable(instance: AppWindowComponent): IActivable {
  let elementPositionX: number;
  let elementPositionY: number;

  const dragObservable = new DragObservable(QuerySelectorOrThrow<HTMLDivElement>(instance, ':scope > .frame > .header'));

  const dragStartObserver = dragObservable
    .addListener('drag-start', () => {
      elementPositionX = ReadDistinctValueObservable(instance.$left);
      elementPositionY = ReadDistinctValueObservable(instance.$top);
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
  instance[`_${ origin }Context`].emit(value);
  // if (value !== instance[`_${ origin }`]) {
  //   instance[`_${ origin }Context`].emit(value);
  //   instance.style.setProperty(origin, `${ value * 100 }%`);
  // }
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
  const oppositeOriginValue: number = ReadDistinctValueObservable(instance[`$${ oppositeOrigin }`]);
  let _value: number;
  if (force) {
    _value = value;
    AppWindowComponentSetInternalPosition(instance, oppositeOrigin, Math.min(oppositeOriginValue, 1 - _value - minSpacing));
  } else {
    _value = Math.min(value, 1 - oppositeOriginValue - minSpacing);
  }
  AppWindowComponentSetInternalPosition(instance, origin, _value);
}




function GetWidth(left: number, right: number): number {
  return 1 - left - right;
}

function GetHeight(top: number, bottom: number): number {
  return 1 - top - bottom;
}

/*---------------------*/


export interface IData {
  // percent: ISource<string>;
  $isMaximized: IObservable<boolean>;
  $enableUserResize: ISource<boolean>;
  $enableUserMove: ISource<boolean>;
  onClickMenuButton: IObserver<MouseEvent>;
  onClickMinimizeButton: IObserver<MouseEvent>;
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

  // @Input()
  // theme: TInput<IWindowTheme>;

  @HostBind('[class.enable-user-resize]', DESKTOP_TEMPLATE_BUILD_OPTIONS)
  readonly $enableUserResize: ISource<boolean>;

  @HostBind('[class.enable-user-move]', DESKTOP_TEMPLATE_BUILD_OPTIONS)
  readonly $enableUserMove: ISource<boolean>;

  readonly $isMaximized: IObservable<boolean>;

  readonly $top: IDistinctValueObservable<number>;
  readonly $bottom: IDistinctValueObservable<number>;
  readonly $left: IDistinctValueObservable<number>;
  readonly $right: IDistinctValueObservable<number>;

  readonly $width: IFunctionObservable<typeof GetWidth>;
  readonly $height: IFunctionObservable<typeof GetHeight>;


  // protected _cancellableContext: ICancellableContext;

  protected _topContext: IDistinctValueObservableContext<number>;
  protected _bottomContext: IDistinctValueObservableContext<number>;
  protected _leftContext: IDistinctValueObservableContext<number>;
  protected _rightContext: IDistinctValueObservableContext<number>;

  protected _enableUserResizeObserver: IObserver<boolean>;
  protected _enableUserMoveObserver: IObserver<boolean>;

  protected _topObserver: IObserver<number>;
  protected _bottomObserver: IObserver<number>;
  protected _leftObserver: IObserver<number>;
  protected _rightObserver: IObserver<number>;

  protected _data: IData;
  protected _allResizeActivable: IActivable;
  protected _moveActivable: IActivable;

  constructor() {
    super();
    // this._cancellableContext = new CancellableContext();

    [this.$top, this._topContext] = CreateDistinctObservableEmitter<number>(0);
    [this.$bottom, this._bottomContext] = CreateDistinctObservableEmitter<number>(0);
    [this.$left, this._leftContext] = CreateDistinctObservableEmitter<number>(0);
    [this.$right, this._rightContext] = CreateDistinctObservableEmitter<number>(0);

    this.$width = new FunctionObservable(GetWidth, [this.$left, this.$right]);
    this.$height = new FunctionObservable(GetHeight, [this.$top, this.$bottom]);

    this.$enableUserResize = new Source<boolean>().emit(true)
    this.$enableUserMove = new Source<boolean>().emit(true)
    this.$isMaximized = $and(
      $equal(this.$top, 0),
      $equal(this.$bottom, 0),
      $equal(this.$left, 0),
      $equal(this.$right, 0),
    );

    this._data = {
      $isMaximized: this.$isMaximized,
      $enableUserResize: this.$enableUserResize,
      $enableUserMove: this.$enableUserMove,
      onClickMenuButton: new Observer<MouseEvent>(() => {
        console.log('menu');
      }).activate(),
      onClickMinimizeButton: new Observer<MouseEvent>(() => {
        console.log('minimize');
      }).activate(),
      onClickMaximizeButton: new Observer<MouseEvent>(() => {
        if (this.$enableUserResize) {
          this.runAnimation(() => {
            this.uniformResize(0);
          });
        }
      }).activate(),
      onClickReduceButton: new Observer<MouseEvent>(() => {
        if (this.$enableUserResize) {
          this.runAnimation(() => {
            this.uniformResize(0.2);
          });
        }
      }).activate(),
      onClickCloseButton: new Observer<MouseEvent>(() => {
        console.log('close');
      }).activate(),
      // percent: new Source<string>()
    };

    this.animations = false;
    this.setLeft(0.1, true);
    this.setTop(0.1, true);
    this.setRight(0.1, false);
    this.setBottom(0.1, false);

    const translateService = LoadService(TranslateService);

    translateService.setTranslations('en', {
      'window.header.button.menu': 'Menu',
      'window.header.button.minimize': 'Minimize',
      'window.header.button.maximize': 'Maximize',
      'window.header.button.reduce': 'Reduce',
      'window.header.button.close': 'Close',
    });

    translateService.setLocale('en');

    (window as any).w = this;
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
    this.setRight(1 - ReadDistinctValueObservable(this.$left) - value, false);
  }

  setWidthFromRight(value: number): void {
    this.setLeft(1 - ReadDistinctValueObservable(this.$right) - value, false);
  }

  setHeightFromTop(value: number): void {
    this.setBottom(1 - ReadDistinctValueObservable(this.$top) - value, false);
  }

  setHeightFromBottom(value: number): void {
    this.setTop(1 - ReadDistinctValueObservable(this.$bottom) - value, false);
  }


  setLeftKeepingWidth(value: number): void {
    const width: number = ReadDistinctValueObservable(this.$width);
    this.setLeft(value, true);
    this.setWidthFromLeft(width);
  }

  setRightKeepingWidth(value: number): void {
    const width: number = ReadDistinctValueObservable(this.$width);
    this.setRight(value, true);
    this.setWidthFromRight(width);
  }

  setTopKeepingHeight(value: number): void {
    const height: number = ReadDistinctValueObservable(this.$height);
    this.setTop(value, true);
    this.setHeightFromTop(height);
  }

  setBottomKeepingHeight(value: number): void {
    const height: number = ReadDistinctValueObservable(this.$height);
    this.setBottom(value, true);
    this.setHeightFromBottom(height);
  }


  uniformResize(position: number = 0): void {
    this.setLeft(position, true);
    this.setTop(position, true);
    this.setRight(position, false);
    this.setBottom(position, false);
  }

  runAnimation(callback: () => void): Promise<void> {
    return new Promise<void>((resolve: any) => {
      this.animations = true;
      const observer = new EventsObservable<HTMLElementEventMap>(this, 'transitionend')
        .addListener('transitionend', (event: Event) => {
          if (event.target === this) {
            observer.deactivate();
            this.animations = false;
            resolve();
          }
        }).activate();
      callback();
    });
  }


  onCreate(context: IComponentContext<IData>): void {
    context.data = this._data;
  }

  onInit(): void {
    this._allResizeActivable = AppWindowComponentCreateAllResizeActivable(this);
    this._moveActivable = AppWindowComponentCreateMoveActivable(this);

    this._enableUserResizeObserver = this.$enableUserResize.pipeTo((enabled: boolean) => {
      this._allResizeActivable.toggle(enabled);
    }).activate();

    this._enableUserMoveObserver = this.$enableUserMove.pipeTo((enabled: boolean) => {
      this._moveActivable.toggle(enabled);
    }).activate();

    this._topObserver = this.$top.pipeTo((value: number) => {
      this.style.setProperty('top', `${ value * 100 }%`);
    }).activate();

    this._bottomObserver = this.$bottom.pipeTo((value: number) => {
      this.style.setProperty('bottom', `${ value * 100 }%`);
    }).activate();

    this._leftObserver = this.$left.pipeTo((value: number) => {
      this.style.setProperty('left', `${ value * 100 }%`);
    }).activate();

    this._rightObserver = this.$right.pipeTo((value: number) => {
      this.style.setProperty('right', `${ value * 100 }%`);
    }).activate();
  }

  onDestroy(): void {
    this._enableUserResizeObserver.deactivate();
    this._enableUserMoveObserver.deactivate();
    this._topObserver.deactivate();
    this._bottomObserver.deactivate();
    this._leftObserver.deactivate();
    this._rightObserver.deactivate();
    // this._cancellableContext.clearAll('destroyed');
  }


}
