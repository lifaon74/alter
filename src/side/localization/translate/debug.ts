import { translateService } from './implementation';
import { ITranslateParams } from './interfaces';
import { $translate } from './pipes';
import { $source } from '@lifaon/observables';

export async function debugTranslateService() {
  await translateService.setTranslations('fr', {
    a: 'a {{ a }} b'
  });
  translateService.setLocale('fr');

  // console.log(await translateService.getTranslations('fr').promise);
  // console.log(await translateService.translate('a', { a: 'hello' }).promise);
  // console.log(await translateService.translateMany(['a']).promise);
  console.log(await translateService.translateMany([['a', { a: 'hello' }]]).toPromise());
}


export async function debugTranslatePipe() {
  await translateService.setTranslations('en', {
    name: 'My name: {{ name }}',
    welcome: 'Welcome',
  });
  await translateService.setTranslations('fr', {
    name: 'Mon nom: {{ name }}',
    welcome: 'Bienvenue',
  });
  translateService.setLocale('en');

  const text = $source<string>('name');
  const params = $source<ITranslateParams>({ name: 'Alice' });

  $translate(text, params)
    .pipeTo((text: string) => {
      console.log('translated:', text);
    }).activate();

  setTimeout(() => {
    params.emit({ name: 'Bob' });
  }, 1000);

  setTimeout(() => {
    text.emit('welcome');
  }, 2000);

  setTimeout(() => {
    translateService.setLocale('fr');
  }, 3000);

  (window as any).text = text;
  (window as any).params = params;
  (window as any).translateService = translateService;
}
