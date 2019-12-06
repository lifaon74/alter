import { Component } from '../../../../core/component/component/class/decorator';
import { IComponent } from '../../../../core/component/component/interfaces';
import { OnConnected, OnCreate, OnDestroy, OnDisconnected, OnInit } from '../../../../core/component/component/implements';
import { IComponentContext } from '../../../../core/component/component/context/interfaces';


export interface IData {
}

/**
 * Example logging the life cycle of a component
 */
@Component({
  name: 'app-life-cycle-debug'
})
export class AppLifeCycleDebug extends HTMLElement implements IComponent<IData>, OnCreate<IData>, OnInit, OnConnected, OnDisconnected, OnDestroy {

  protected context: IComponentContext<IData>;

  constructor() {
    super();
  }

  onCreate(context: IComponentContext<IData>) {
    this.context = context;
    this.context.data = {};
    console.log('onCreate');
  }

  onInit() {
    console.log('onInit');
  }

  onConnected() {
    console.log('onConnected');
  }

  onDisconnected() {
    console.log('onDisconnected');
  }

  onDestroy() {
    console.log('onDestroy');
  }
}
