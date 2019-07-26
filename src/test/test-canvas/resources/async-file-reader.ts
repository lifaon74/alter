import { CancellablePromise, EventsObservable, ICancellablePromise, ICancelToken } from '@lifaon/observables';


interface IFormatsToTypeMap {
  dataURL: string;
  text: string;
  arrayBuffer: ArrayBuffer;
}

export type TFileReaderReadType = keyof IFormatsToTypeMap;


type IFormats = {
  [K in keyof IFormatsToTypeMap]?: ICancellablePromise<IFormatsToTypeMap[K]>;
}


const blobContentCache: WeakMap<Blob, IFormats> = new WeakMap<Blob, IFormats>();

export function ReadBlob<T extends TFileReaderReadType>(blob: Blob, type: T, token?: ICancelToken, cache: boolean = false): ICancellablePromise<IFormatsToTypeMap[T]> {
  type TValue = IFormatsToTypeMap[T];

  if (cache) {
    let formats: IFormats | undefined = blobContentCache.get(blob);
    if (formats === void 0) {
      formats = {};
      blobContentCache.set(blob, formats);
    }

    if ((formats[type] === void 0) || formats[type].token.cancelled) {
      formats[type] = ReadBlob(blob, type, token, false) as ICancellablePromise<any>;
    }

    return formats[type] as ICancellablePromise<any> as ICancellablePromise<TValue>;
  } else {
    return new CancellablePromise<TValue>((resolve: any, reject: any, token: ICancelToken) => {
      const reader: FileReader = new FileReader();

      const clear = () => {
        fileReaderOnload.deactivate();
        fileReaderOnError.deactivate();
        tokenObserver.deactivate();
      };

      const fileReaderObservable = new EventsObservable<FileReaderEventMap>(reader);

      const fileReaderOnload = fileReaderObservable.addListener('load', () => {
        clear();
        resolve(reader.result);
      });

      const fileReaderOnError = fileReaderObservable.addListener('error', () => {
        clear();
        reject(reader.error);
      });

      const tokenObserver = token.addListener('cancel', () => {
        clear();
        reader.abort();
      });

      fileReaderOnload.activate();
      fileReaderOnError.activate();
      tokenObserver.activate();

      switch (type) {
        case 'dataURL':
          reader.readAsDataURL(blob);
          break;
        case 'text':
          reader.readAsText(blob);
          break;
        case 'arrayBuffer':
          reader.readAsArrayBuffer(blob);
          break;
        default:
          throw new TypeError(`Expected 'dataURL', 'text', or 'arrayBuffer' as type`);
      }
    }, token);
  }
}

export function ReadBlobAsDataURL(blob: Blob, token?: ICancelToken, cache?: boolean): ICancellablePromise<string> {
  return ReadBlob<'dataURL'>(blob, 'dataURL', token, cache);
}

export function ReadBlobAsText(blob: Blob, token?: ICancelToken, cache?: boolean): ICancellablePromise<string> {
  return ReadBlob<'text'>(blob, 'text', token, cache);
}

export function ReadBlobAsArrayBuffer(blob: Blob, token?: ICancelToken, cache?: boolean): ICancellablePromise<ArrayBuffer> {
  return ReadBlob<'arrayBuffer'>(blob, 'arrayBuffer', token, cache);
}
