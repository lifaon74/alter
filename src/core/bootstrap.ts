import { HTMLElementConstructor } from './custom-node/helpers/NodeHelpers';

export interface IModule {
  components: Iterable<HTMLElementConstructor>;
}

export function bootStrap(module: IModule): void {
  console.log('Alter started');
}
