import { ICSSStatic, ICSSStyleValueStatic, ICSSUnitValueConstructor } from './houdini';
import { TProgression } from './types';
import {
  ApplyTimingFunctionToTransition, CreateCSSPropertyTransition, CreateDynamicTransition
} from './transitions/transition-functions';
import { CreateEaseInOutTimingFunction } from './timing-functions/timing-functions';
import { TTransitionFunction } from './transitions/types';


declare const CSSUnitValue: ICSSUnitValueConstructor;
declare const CSSStyleValue: ICSSStyleValueStatic;
declare const CSS: ICSSStatic;


/** FUNCTIONS **/

export function NormalizeProgression(progression: TProgression): number {
  return Math.max(0, Math.min(1, progression));
}


export type TAnimateFunction = (progress: TProgression) => void;

export function CreateCSSPropertyAnimation(
  element: HTMLElement,
  propertyName: string,
  transition: TTransitionFunction<string>,
): TAnimateFunction {
  return (progression: TProgression): void => {
    element.style.setProperty(propertyName, transition(progression));
  };
}

export function CreateNoopAnimation(): TAnimateFunction {
  return () => {};
}

export type TAnimationWithWeightTuple = [TAnimateFunction, number];

export function CreateSequentialAnimation(animations: TAnimationWithWeightTuple[]): TAnimateFunction {
  if (animations.length === 0) {
    return CreateNoopAnimation();
  } else {
    const totalWeight: number = animations.reduce((totalWeight: number, [animation, weight]: TAnimationWithWeightTuple, index: number) => {
      if ((0 <= weight) && (weight < Number.MAX_SAFE_INTEGER)) {
        return totalWeight + weight;
      } else {
        throw new RangeError(`Animation's weight at index ${ index } must be in the range [0, number.MAX_SAFE_INTEGER[`);
      }
    }, 0);

    if (totalWeight < Number.MAX_SAFE_INTEGER) {
      let startProgression: number = 0;
      let index: number = 0;
      return (progression: TProgression): void => {
        const relativeProgression: number = (progression - startProgression) * (totalWeight / animations[index][1]);
        console.log(relativeProgression);
          // animations[index](progression)
      };
    } else {
      throw new RangeError(`totalWeight must be in the range [0, number.MAX_SAFE_INTEGER[`);
    }
  }
}


export function Animate(animation: TAnimateFunction, duration: number): Promise<void> {
  return new Promise<void>((resolve: any) => {
    const startTime: number = Date.now();
    let initialized: boolean = false;
    const loop = () => {
      let progress: number;
      if (initialized) {
        progress = NormalizeProgression((Date.now() - startTime) / duration);
      } else {
        initialized = true;
        progress = 0;
      }
      animation(progress);
      if (progress < 1) {
        requestAnimationFrame(loop);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(loop);
  });
}

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

  const _transition = ApplyTimingFunctionToTransition(transition, timingFunction);

  for (let i = 0, l = 10; i <= l; i++) {
    console.log(_transition(i / l));
  }
}

async function testAnimation1() {
  const element = createDummyElement();
  document.body.appendChild(element);


  const timingFunction = CreateEaseInOutTimingFunction();

  let propertyName: string;
  let transition: TTransitionFunction<string>;

  // propertyName = 'background-color';
  // transition = CreateCSSPropertyTransition(propertyName, 'red', 'blue');

  propertyName = 'width';
  transition = CreateCSSPropertyTransition(propertyName, '0', '500px');

  transition = ApplyTimingFunctionToTransition(transition, timingFunction);
  const animation = CreateCSSPropertyAnimation(element, propertyName, transition);

  const animation2 = CreateSequentialAnimation([
    [animation, 1000],
    [animation, 2000],
  ]);

  Animate(animation2, 2000);
  // for (let i = 0, l = 100; i <= l; i++) {
  //   animation(i / l);
  // }
}


/*
const animation = seq([
  [animation1, duration1],
])
*/

export async function testAnimation() {
  // await testTransitions1();
  await testAnimation1();
}
