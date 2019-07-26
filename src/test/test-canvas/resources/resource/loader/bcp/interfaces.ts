import { IResource } from '../../interfaces';


export interface IResourceDetails {
  url: string,
  size: number;
  type: string;
}

export interface IResourceLoaderConstructor {
  // new(init: IResourceInit, options?: ICloneableObjectOptions): IResource;
}

export interface IResourceLoader {
  loadResource(id: string, urls: string[]): Promise<IResource>;
  // getResourceDetails(url: string, details: IResourceDetails = Object.assign({}, DEFAULT_RESOURCE_DETAILS)): Promise<IResourceDetails>;
  // getBestResourceDetails(urls: string[], compareFunction: (a: IResourceDetails | null, b: IResourceDetails | null) => number = CompareResourceDetails): Promise<IResourceDetails[]>;
}


