import { translateService } from './implementation';
import { $source } from '@lifaon/observables/operators/misc';
import { ITranslateParams } from './interfaces';
import { $translate } from './pipes';

export async function testTranslateService() {
  await translateService.setTranslations('fr', {
    a: 'a {{ a }} b'
  });
  translateService.setLocale('fr');

  // console.log(await translateService.getTranslations('fr'));
  // console.log(await translateService.translate('a', { a: 'hello' }));
  // console.log(await translateService.translateMany(['a']));
  console.log(await translateService.translateMany([['a', { a: 'hello' }]]));
}


export async function testTranslatePipe() {
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
