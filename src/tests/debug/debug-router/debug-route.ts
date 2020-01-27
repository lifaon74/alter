import { Route } from '../../../side/router/route/implementation';
import { TPathMatcherParams } from '../../../side/router/path-matcher/interfaces';
import { IRoutePath } from '../../../side/router/route/route-path/interfaces';
import { assert } from '../../../classes/asserts';


export async function debugBaseRoute() {
  const route = new Route('/', {
    children: [
      new Route('/route1', {
        exec: () => {
          console.log('route 1 resolved');
        }
      }),
      new Route('/route2/:id', {
        exec: (params: TPathMatcherParams) => {
          console.log('route 2 resolved', params);
        }
      }),
      new Route('/route3', {
        exec: (params: TPathMatcherParams) => {
          console.log('route 3 resolved', params);
        },
        children: [
          new Route('/child', {
            exec: (params: TPathMatcherParams) => {
              console.log('route 3 child resolved', params);
            }
          }),
        ]
      }),
      new Route('/route4/**', {
        exec: () => {
          console.log('route 1 resolved');
        }
      }),
    ]
  });

  await assert(async () => (await route.resolve('/')) === null);
  await assert(async () => (await route.resolve('/route2')) === null);
  await assert(async () => (await route.resolve('/route1/undefined')) === null);
  await assert(async () => (await route.resolve('/route3/undefined')) === null);

  ((await route.resolve('/route1')) as IRoutePath).exec();
  ((await route.resolve('/route2/48')) as IRoutePath).exec();
  ((await route.resolve('/route3')) as IRoutePath).exec();
  ((await route.resolve('/route3/child')) as IRoutePath).exec();
}


/**
 * TODO:
 *  - work on ComponentRoute
 */
export async function debugComponentRoute() {

}

export async function debugRoute() {
  await debugBaseRoute();
  await debugComponentRoute();
}
