import { navigation } from '../../../side/navigate/navigation/implementation';
import { QueryParamsObservable } from '../../../side/navigate/navigation/query-params-observable/implementation';

export async function debugQueryParamsChange() {
  const observable = new QueryParamsObservable({ names: ['id'] });
  observable.pipeTo((result: any) => {
    console.log('change', Object.fromEntries(result));
  }).activate();

  const url = new URL(window.location.href);
  url.searchParams.set('id', 'my-id-1');
  await navigation.navigate(url, { replaceState: true });
  url.searchParams.set('id', 'my-id-2');
  await navigation.navigate(url, { replaceState: true });
  url.searchParams.delete('id');
  await navigation.navigate(url, { replaceState: true });
}

