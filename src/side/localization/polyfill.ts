
const polyfilledLocales: string[] = [];
export function polyfillIntl(locales: string[] = []): Promise<void> {
  return new Promise<void>((resolve: any, reject: any) => {
    const localesToPolyfill: string[] = locales.filter((locale: string) => polyfilledLocales.includes(locale));

    if (localesToPolyfill.length > 0) {
      Array.prototype.push.apply(polyfilledLocales, localesToPolyfill);

      const scriptElement: HTMLScriptElement = document.createElement('script');
      const features: string = localesToPolyfill.map((locale: string) => ('Intl.~locale.' + encodeURIComponent(locale))).join(',');
      const callbackName: string = new Array(16).fill(null).map(() => String.fromCodePoint(0x61 + Math.floor(Math.random() * 26))).join('');

      const onError = () => {
        _reject('bad request');
      };

      const clear = () => {
        delete (window as any)[callbackName];
        scriptElement.removeEventListener('error', onError);
        document.head.removeChild(scriptElement);
        clearTimeout(timer);
      };

      const _resolve = () => {
        clear();
        resolve();
      };

      const _reject = (message: string) => {
        clear();
        reject(new Error('Failed to load polyfill: ' + message));
      };


      const timer = setTimeout(() => {
        _reject('request timeout');
      }, 30000);

      (window as any)[callbackName] = _resolve;

      scriptElement.addEventListener('error', onError);
      scriptElement.src = `https://cdn.polyfill.io/v2/polyfill.min.js?features=${ features }&callback=${ encodeURIComponent(callbackName) }`;

      document.head.appendChild(scriptElement);
    } else {
      resolve();
    }
  });
}
