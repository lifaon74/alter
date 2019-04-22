import { UpdatableCollection } from './UpdatableCollection';

export class VirtualHTMLCollection<T extends Element> extends UpdatableCollection<T> implements HTMLCollectionOf<T> {

  constructor(updateFunction: () => ArrayLike<T>) {
    super(updateFunction);
  }

  item(index: number): T | null {
    return this[index] || null;
  }

  namedItem(name: string): T | null {
    for (let i = 0, l = this.length; i < l; i++) {
      if ((this[i].id === name) || ((this[i] as any).name === name)) {
        return this[i];
      }
    }
    return null;
  }

  [Symbol.toStringTag]: string = 'HTMLCollection';
}
