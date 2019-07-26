// import { IResourceLoader } from './interfaces';
// import { ConstructClassWithPrivateMembers } from '../../../../../misc/helpers/ClassWithPrivateMembers';
//
//
//
// export const RESOURCE_LOADER_PRIVATE = Symbol('resource-loader-private');
//
// export interface IResourceLoaderPrivate {
//
// }
//
// export interface IResourceLoaderInternal extends IResourceLoader {
//   [RESOURCE_LOADER_PRIVATE]: IResourceLoaderPrivate;
// }
//
//
//
// export function ConstructResourceLoader(
//   instance: IResourceLoader,
// ): void {
//   ConstructClassWithPrivateMembers(instance, RESOURCE_LOADER_PRIVATE);
//   const privates: IResourceLoaderPrivate = (instance as IResourceLoaderInternal)[RESOURCE_LOADER_PRIVATE];
//
// }
//
// // export function ResourceLoaderGetId(instance: IResourceLoader): string {
// //   return (instance as IResourceLoaderInternal)[RESOURCE_LOADER_PRIVATE].id;
// // }
//
//
// export class ResourceLoader implements IResourceLoader {
//
//   constructor() {
//     ConstructResourceLoader(this);
//   }
//
//   loadResource(id: string, urls: string[], progress?: ProgressCallback): Promise<IResource> {
//     return this.getBestResourceDetails(urls)
//       .then((details: ResourceDetails[]) => {
//         if (details.length === 0) {
//           throw new Error(`Unable to load media: ${urls.join(', ')}`);
//         } else {
//           return LoadFile(details[0].url, progress)
//             .then((blob: Blob) => this._blobToResource(id, blob));
//         }
//       });
//   }
//
// }
