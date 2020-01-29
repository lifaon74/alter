import { navigation } from '../../../side/navigate/navigation/implementation';

export async function debugNavigation() {
  console.log(Array.from(navigation.history));
  (window as any).nav = navigation;
  window.onpopstate = () => {
    console.log('popstate');
  };

  // console.log(nativeHistory.length, nativeHistoryLastLength);
  navigation.navigate('hello1');
  navigation.navigate('hello2');
  navigation.back();
  navigation.forward();
  // nav.navigate('hello3', true);
  // nav.navigate('hello1');
  // await nav.back();
  // await nav.forward();
  navigation.navigate('hello3');
  console.log(window.location.href);
}
