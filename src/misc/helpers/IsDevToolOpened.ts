
export function IsDevToolOpened(): boolean {
  const devtools: any = function() {};
  devtools.toString = function() {
    devtools.opened = true;
  };

  console.log('%c', devtools);
  return devtools.opened;
}
