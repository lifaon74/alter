// export function CreateHTMLImageElement(url: string): HTMLImageElement {
//   const image: HTMLImageElement = new Image();
//   image.src = url;
//   return image;
// }
//
//
// export function AwaitHTMLImageElementLoaded(image: HTMLImageElement): Promise<HTMLImageElement> {
//   return new Promise<HTMLImageElement>((resolve: any, reject: any) => {
//     const onLoad = () => {
//       if (image.naturalWidth === 0) {
//         onError();
//       } else{
//         resolve(image);
//       }
//     };
//
//     const onError = () => {
//       reject(new Error(`Image failed to load: ${ image.src.substring(0, 100) }`));
//     };
//
//     if (image.complete && (image.src !== '')) {
//       onLoad();
//     } else {
//
//       const clear = () => {
//         image.removeEventListener('load', _onLoad, false);
//         image.removeEventListener('error', _onError, false);
//       };
//
//       const _onLoad = () => {
//         clear();
//         onLoad();
//       };
//
//       const _onError = () => {
//         clear();
//         onError();
//       };
//
//       image.addEventListener('load', _onLoad, false);
//       image.addEventListener('error', _onError, false);
//     }
//   });
// }
//
// export function LoadAsHTMLImageElement(url: string): Promise<HTMLImageElement> {
//   return AwaitHTMLImageElementLoaded(CreateHTMLImageElement(url));
// }



/*---------------------------------------------------*/




export class AssetsLoader {

  private _assets: Map<string, Promise<HTMLImageElement>>;
  private _assetsSync: Map<string, HTMLImageElement>;
  private _tiles: Map<string, HTMLImageElement>;

  constructor() {
    this._assets = new Map<string, Promise<HTMLImageElement>>();
    this._assetsSync = new Map<string, HTMLImageElement>();
    this._tiles = new Map<string, HTMLImageElement>();
  }

  // loa

  load(url: string): Promise<HTMLImageElement> {
    if (!this._assets.has(url)) {
      this._assets.set(url, LoadAsHTMLImageElement(url));
    }
    return this._assets.get(url);
  }

  loadSync(url: string): HTMLImageElement | Promise<HTMLImageElement> {
    if (this._assetsSync.has(url)) {
      return this._assetsSync.get(url);
    } else {
      return this.load(url)
        .then((image: HTMLImageElement) => {
          this._assetsSync.set(url, image);
          return image;
        });
    }
  }

  // loadTile(url: string, x: number, y: number, width: number, height: number): Promise<HTMLImageElement> {
  //
  // }

  // loadTileSync(url: string, x: number, y: number, width: number, height: number): HTMLImageElement | null {
  //
  // }
}
