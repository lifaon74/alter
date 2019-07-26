import { IImageResource, IImageResourceInit } from './interfaces';
import { ConstructClassWithPrivateMembers } from '../../../../misc/helpers/ClassWithPrivateMembers';
import { ICloneableObjectOptions } from '../../misc/CloneableObject';
import { Media } from '../media/implementation';
import { AwaitHTMLImageElementLoaded, CreateHTMLImageElement } from './helpers';

export const ImageResource_PRIVATE = Symbol('imageResource-private');

export interface IImageResourcePrivate {
  id: string;
  type: string;
  blob: Blob;
}

export interface IImageResourceInternal extends IImageResource {
  [ImageResource_PRIVATE]: IImageResourcePrivate;
}

export function ConstructImageResource(
  instance: IImageResource,
  init: IImageResourceInit,
  options: ICloneableObjectOptions = {},
): void {
  ConstructClassWithPrivateMembers(instance, ImageResource_PRIVATE);
  // const privates: IImageResourcePrivate = (instance as IImageResourceInternal)[ImageResource_PRIVATE];
  if (instance.type !== 'image') {
    throw new TypeError(`Expected 'image' as type`);
  }
}


export class ImageResource extends Media implements IImageResource {

  constructor(init: IImageResourceInit, options?: ICloneableObjectOptions) {
    if ((init.type !== void 0) && (init.type !== 'image')) {
      throw new TypeError(`Expected 'image' as type`);
    }

    super(
      Object.assign({
        type: 'image'
      }, init),
      options
    );
    ConstructImageResource(this, init, options);
  }

  get type(): 'image' {
    return 'image'; // or super.type as 'image'
  }

  toHTMLElement(): Promise<HTMLImageElement> {
    return this.toTemporaryObjectURL<HTMLImageElement>((url: string) => {
      return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(url));
    });
  }
}
