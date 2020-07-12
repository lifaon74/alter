import { ICSSStatic, ICSSStyleValueStatic, ICSSUnitValueConstructor } from './houdini';
import { CreateCSSPropertyTransition } from './transitions/transition-functions';
import { ApplyTimingFunction, CreateEaseInOutTimingFunction } from './timing-functions/timing-functions';
import {
  CreateAnimateFunction, CreateDelayAnimateFunction, CreateHTMLElementsAnimateFunctionWithKnownElements,
  CreateParallelAnimateFunction, CreateSequentialAnimateFunction
} from './animate/animate';
import { CreateCSSAnimation, CreateReverseAnimation } from './animations/animations';


declare const CSSUnitValue: ICSSUnitValueConstructor;
declare const CSSStyleValue: ICSSStyleValueStatic;
declare const CSS: ICSSStatic;


export type TPrimitive =
  number
  | string
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

/** FUNCTIONS **/


/*----------------------------*/


// export class StyleState<TState extends TStyleState> {
//   readonly state: Readonly<TState>;
//
//   constructor(state: TState) {
//     this.state = Object.freeze(state);
//   }
// }


// export class Animation<TVariables extends string[]> {
//   readonly variables: IReadonlyTuple<TVariables>;
//
//   constructor(variables: TVariables) {
//     this.variables = new ReadonlyTuple(variables);
//   }
// }

// export class Animation {
//   readonly startState: TStyleState;
//   readonly endState: TStyleState;
//
//   constructor(variables: TVariables) {
//     this.variables = new ReadonlyTuple(variables);
//   }
// }

/*----------------------------*/


function createDummyElement(): HTMLDivElement {
  const element: HTMLDivElement = document.createElement('div');
  element.style.width = '100px';
  element.style.height = '100px';
  element.style.background = 'red';
  return element;
}

async function testTransitions1() {
  const element = createDummyElement();
  document.body.appendChild(element);

  const timingFunction = CreateEaseInOutTimingFunction();

  // const transition = CreateFixedCSSNumericValueTransition(CSS.px(0), CSS.px(5000));
  const transition = CreateCSSPropertyTransition('background-color', 'red', 'blue');

  const _transition = ApplyTimingFunction(timingFunction, transition);

  for (let i = 0, l = 10; i <= l; i++) {
    console.log(_transition(i / l));
  }
}

// async function testAnimation1() {
//   const element = createDummyElement();
//   document.body.appendChild(element);
//
//
//   const timingFunction = CreateEaseInOutTimingFunction();
//
//   let propertyName: string;
//   let transition: TTransitionFunction<string>;
//
//   // propertyName = 'background-color';
//   // transition = CreateCSSPropertyTransition(propertyName, 'red', 'blue');
//
//   propertyName = 'width';
//   transition = CreateCSSPropertyTransition(propertyName, '0', '500px');
//
//   transition = ApplyTimingFunctionToTransition(transition, timingFunction);
//   const animation = CreateCSSPropertyAnimation(element, propertyName, transition);
//
//
//   // const animation2 = CreateSequentialAnimation([
//   //   [animation, 1000],
//   //   [animation, 2000],
//   // ] as Iterable<TAnimationWithWeight>);
//
//   // for (let i = 0, l = 10; i <= l; i++) {
//   //   animation2(i / l);
//   // }
//
//   const animate = CreateAnimateFunction(animation, 2000);
//
//   await animate();
// }

// async function testAnimation2() {
//   const element = createDummyElement();
//   element.innerText = 'hello world';
//   element.style.setProperty('display', 'inline-block');
//   element.style.setProperty('overflow', 'auto');
//   document.body.appendChild(element);
//
//
//   const animation = CreateCSSAnimation(
//     {
//       width: '400px',
//       'background-color': 'red'
//     },
//     {
//       width: 'auto',
//       'background-color': 'blue'
//     },
//     'ease-in-out'
//   );
//
//   const animate = CreateAnimateFunction(animation, 2000);
//
//   console.time('animate');
//   await animate(void 0, [element]).toPromise();
//   console.timeEnd('animate');
// }


async function testAnimation3() {
  const element = createDummyElement();
  element.innerText = 'hello world';
  element.style.setProperty('display', 'inline-block');
  element.style.setProperty('overflow', 'auto');
  document.body.appendChild(element);


  const animation1 = CreateCSSAnimation(
    {
      width: '400px',
    },
    {
      width: 'auto',
    },
    'ease-in-out'
  );

  const animation2 = CreateCSSAnimation(
    {},
    {
      height: '400px',
    },
    'ease-in-out'
  );

  const animation3 = CreateCSSAnimation(
    {
      'background-color': 'white',
    },
    {
      'background-color': 'blue',
    },
    'ease-in-out'
  );

  const animate = CreateSequentialAnimateFunction([
    CreateAnimateFunction(animation1, 2000),
    CreateDelayAnimateFunction(1000),
    CreateParallelAnimateFunction([
      CreateAnimateFunction(animation2, 2000),
      CreateHTMLElementsAnimateFunctionWithKnownElements(CreateReverseAnimation(animation3), 2000, [document.body]),
    ]),
  ]);

  console.time('animate');
  await animate(void 0, [element]).toPromise();
  console.timeEnd('animate');
}


export async function testAnimation() {
  // await testTransitions1();
  // await testAnimation1();
  // await testAnimation2();
  await testAnimation3();
}
