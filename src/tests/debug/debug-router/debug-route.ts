// import { Route } from '../../../side/navigate/route/implementation';
// import { IRoutePath } from '../../../side/navigate/route/route-path/interfaces';
// import { assert, assertFails } from '../../../classes/asserts';
// import { TPathMatcherParams } from '../../../side/navigate/path-matcher/types';
// import { ComponentRoute } from '../../../side/navigate/component-route/implementation';
// import { Component } from '../../../core/component/component/class/decorator';
// import { TAbortStrategy, TNativePromiseLikeOrValue } from '@lifaon/observables';
// import { ITemplate } from '../../../core/template/interfaces';
// import { IStyle } from '../../../core/style/interfaces';
// import { IHostBinding } from '../../../core/component/host-binding/interfaces';
// import { Template } from '../../../core/template/implementation';
// import { DEFAULT_TEMPLATE_BUILD_OPTIONS } from '../../../core/template/helpers';
// import { Router } from '../../../side/navigate/router/implementation';
// import { IRouteExecParams } from '../../../side/navigate/route/types';
//
//
// export async function debugBaseRoute() {
//   const route = new Route('/', {
//     children: [
//       new Route('/route1', {
//         exec: () => {
//           console.log('route 1 resolved');
//         }
//       }),
//       new Route('/route2/:id', {
//         exec: <TStrategy extends TAbortStrategy>(params: IRouteExecParams<any, TStrategy>) => {
//           console.log('route 2 resolved', params);
//         }
//       }),
//       new Route('/route3', {
//         exec: (params: IRouteExecParams<any, TAbortStrategy>) => {
//           console.log('route 3 resolved', params);
//         },
//         children: [
//           new Route('/child', {
//             exec: (params: IRouteExecParams<any, TAbortStrategy>) => {
//               console.log('route 3 child resolved', params);
//             }
//           }),
//         ]
//       }),
//       new Route('/route4/**', {
//         exec: () => {
//           console.log('route 1 resolved');
//         }
//       }),
//     ]
//   });
//
//   await assert(async () => (await route.resolve('/')) === null);
//   await assert(async () => (await route.resolve('/route2')) === null);
//   await assert(async () => (await route.resolve('/route1/undefined')) === null);
//   await assert(async () => (await route.resolve('/route3/undefined')) === null);
//
//   await ((await route.resolve('/route1')) as IRoutePath).exec().promise;
//   await ((await route.resolve('/route2/48')) as IRoutePath).exec().promise;
//   await ((await route.resolve('/route3')) as IRoutePath).exec().promise;
//   await ((await route.resolve('/route3/child')) as IRoutePath).exec().promise;
// }
//
// export async function debugRouteWithDefault() {
//   const route = new Route('/', {
//     children: [
//       new Route('/route1', {
//         exec: () => {
//           console.log('route 1 resolved');
//         }
//       }),
//       new Route('/route2**', {
//         exec: () => {
//           console.log('route 2 wildcard resolved');
//         }
//       }),
//       new Route('/**', {
//         exec: () => {
//           console.log('route default resolved');
//         }
//       }),
//     ]
//   });
//
//   await ((await route.resolve('/route1')) as IRoutePath).exec().promise; // => route 1 resolved
//   await ((await route.resolve('/route1/')) as IRoutePath).exec().promise; // => route 1 resolved
//   await ((await route.resolve('/route2')) as IRoutePath).exec().promise; // => route 2 wildcard resolved
//   await ((await route.resolve('/route2/48')) as IRoutePath).exec().promise; // => route 2 wildcard resolved
//   await ((await route.resolve('/route3')) as IRoutePath).exec().promise; // => route default resolved
//   await ((await route.resolve('/route3/child')) as IRoutePath).exec().promise; // => route default resolved
//   await ((await route.resolve('/')) as IRoutePath).exec().promise; // => route default resolved
// }
//
//
// @Component({
//   name: 'component-a',
//   template: Template.fromString(`
//       <div class="text">hello from component A</div>
//       <router></router>
//     `, DEFAULT_TEMPLATE_BUILD_OPTIONS)
// })
// class ComponentA extends HTMLElement {}
//
//
// @Component({
//   name: 'component-b',
//   template: Template.fromString(`
//       <div class="text">hello from component B</div>
//     `, DEFAULT_TEMPLATE_BUILD_OPTIONS)
// })
// class ComponentB extends HTMLElement {}
//
// @Component({
//   name: 'component-c',
//   template: Template.fromString(`
//       <div class="text">hello from component C</div>
//     `, DEFAULT_TEMPLATE_BUILD_OPTIONS)
// })
// class ComponentC extends HTMLElement {}
//
// export async function debugComponentRoute() {
//   const route = new ComponentRoute('/a', {
//     component: 'component-a',
//     children: [
//       new ComponentRoute('/b', {
//         component: 'component-b',
//       })
//     ]
//   });
//
//   await assertFails(async () => ((await route.resolve('/a')) as IRoutePath).exec()); // will fail because no <router/> exists
//
//   document.body.appendChild(document.createElement('router'));
//   // await ((await route.resolve('/a')) as IRoutePath).exec();
//   // await ((await route.resolve('/a/b')) as IRoutePath).exec();
//
//   const router = Router.create({ route });
//
//   await router.navigate('/');
// }
//
export async function debugRoute() {
  // await debugBaseRoute();
  // await debugRouteWithDefault();
  // await debugComponentRoute();
}
