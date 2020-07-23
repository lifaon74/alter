import { ApplyTimingFunction, CreateEaseInOutTimingFunction } from './timing-functions/timing-functions';
import { CreateCSSPropertyTransition } from './transitions/css-property';
import { animate, animate_seq_states, animation, state } from './shortcuts';
import { AdvancedAbortController } from '@lifaon/observables';


function createDummyElement(
  width: string = '100px',
  height: string = '100px',
  color: string = 'red'
): HTMLDivElement {
  const element: HTMLDivElement = document.createElement('div');
  element.style.width = width;
  element.style.height = height;
  element.style.background = color;
  element.style.display = 'inline-block';
  element.style.overflow = 'auto';
  element.style.overflow = 'auto';
  element.style.fontSize = '20px';
  element.innerText = 'A';
  return element;
}

async function testTransition1() {
  const element = createDummyElement();
  document.body.appendChild(element);

  const timingFunction = CreateEaseInOutTimingFunction();

  // const transition = CreateFixedCSSNumericValueTransition(CSS.px(0), CSS.px(5000));
  const { transition, isComputed } = CreateCSSPropertyTransition('background-color', 'red', 'blue');

  const _transition = ApplyTimingFunction(timingFunction, transition);

  for (let i = 0, l = 10; i <= l; i++) {
    console.log(_transition(i / l, element));
  }
}

async function testAnimation2() {
  const element = createDummyElement();
  element.innerText = 'hello world';
  document.body.appendChild(element);

  const animations = [
    ['200px', '400px'],
    ['auto', '400px'],
    ['400px', 'auto'],
    [void 0, 'auto'],
    [null, '400px'],
    ['400px', void 0],
  ].map(([a, b]) => {
    return animation({
      width: a,
    }, {
      width: b,
    });
  });

  const _animate = animate(animations[5], { duration: 2000 });
  await _animate(void 0, [element]).toPromise();
}

async function testAnimation3() {
  const element = createDummyElement();
  element.innerText = 'hello world';
  document.body.appendChild(element);


  const animation1 = animation(
    {
      width: '400px',
    },
    {
      width: 'auto',
    },
    'ease-in-out'
  );

  const animation2 = animation(
    {},
    {
      height: '400px',
    },
    'ease-in-out'
  );

  const animation3 = animation(
    {
      // 'background-color': 'white',
    },
    {
      'background-color': 'blue',
    },
    'ease-in-out'
  );

  // const _animate = animate(animation1, { duration: 2000 });
  const _animate = animate(animation2, { duration: 2000 });

  // const _animate = animate_seq<[HTMLElementArray]>([
  //   animate(animation1, { duration: 2000 }),
  //   animate_delay(1000),
  //   animate_par<any[]>([
  //     animate(animation2, { duration: 2000 }),
  //     animate(animation3, { duration: 2000, elements: [document.body] }),
  //   ]),
  // ]);

  console.time('animate');
  await _animate(void 0, [element]).toPromise();
  console.timeEnd('animate');
}

async function testAnimation4() {
  const element = createDummyElement();
  document.body.appendChild(element);

  const _animate = animate(
    animation({
      width: '100px',
    }, {
      width: '90%',
    }), {
      duration: 2000,
      elements: [element]
    });

  await _animate().toPromise();
}

async function testAnimation5() {
  const element = createDummyElement();
  document.body.appendChild(element);

  const state1 = state({
    // transform: 'translateY(0)',
    // transform: 'scale(0)',
    // transform: 'rotate(0)',
    // transform: 'skew(0deg)',
    // transform: 'perspective(0) rotateY(-45deg)',
    // transform: 'translateY(0) rotate(0)',
    // transform: 'perspective(400px) rotateY(-45deg)',
    transform: 'translateY(0) rotate(45deg)',
  });

  const state2 = state({
    // transform: 'translateY(200px)',
    // transform: 'scale(2)',
    // transform: 'rotate(45deg)',
    // transform: 'rotate(90deg)',
    // transform: 'skew(10deg)',
    // transform: 'perspective(400px) rotateY(-45deg)',
    // transform: 'translateY(200px) rotate(180deg)',
    // transform: 'perspective(400px) rotateY(45deg)',
    transform: 'translateY(200px) rotate(45deg)',
  });

  const animation1 = animation(state1, state2);
  // const animation2 = animation(state2, state1);

  // for (let i = 0, l = 10; i <= l; i++) {
  //   animation1(i / l, [element]);
  //   await $delay(500);
  // }

  const controller = new AdvancedAbortController();
  const _animate = animate(animation1, { duration: 1000 });
  // const _animate = animate_loop(animate_seq([
  //   animate(animation1, 1000),
  //   animate(animation2, 1000),
  // ]));

  setTimeout(() => controller.abort(), 5000);

  await _animate({ signal: controller.signal }, [element]).toPromise({ strategy: 'resolve' });
}


async function testAnimation6() {
  const html: string = `
    <style>
    * { box-sizing: border-box; }
    
    .scene {
      width: 200px;
      height: 200px;
      border: 1px solid #CCC;
      margin: 80px;
      perspective: 400px;
      font-family: sans-serif;
    }
    
    .scene > .cube {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
    }
    
    .scene > .cube > * {
      position: absolute;
      width: 200px;
      height: 200px;
      border: 2px solid black;
      line-height: 200px;
      font-size: 40px;
      font-weight: bold;
      color: white;
      text-align: center;
    }
    
    .scene > .cube > .front {
      background: hsla(  0, 100%, 50%, 0.7);
      transform: rotateY(  0deg) translateZ(100px);
    }
    .scene > .cube > .right {
      background: hsla( 60, 100%, 50%, 0.7);
      transform: rotateY( 90deg) translateZ(100px);
    }
    .scene > .cube > .back  {
      background: hsla(120, 100%, 50%, 0.7);
      transform: rotateY(180deg) translateZ(100px);
    }
    .scene > .cube > .left {
      background: hsla(180, 100%, 50%, 0.7);
      transform: rotateY(-90deg) translateZ(100px);
    }
    .scene > .cube > .top {
      background: hsla(240, 100%, 50%, 0.7);
      transform: rotateX( 90deg) translateZ(100px);
    }
    .scene > .cube > .bottom {
      background: hsla(300, 100%, 50%, 0.7);
      transform: rotateX(-90deg) translateZ(100px);
    }
    
   
    </style>
    <div class="scene">
      <div class="cube">
        <div class="front">front</div>
        <div class="back">back</div>
        <div class="right">right</div>
        <div class="left">left</div>
        <div class="top">top</div>
        <div class="bottom">bottom</div>
      </div>
    </div>
  `;

  document.body.innerHTML = html;

  const showFront = state({
    transform: `translateZ(-100px) rotateY(0deg)`,
  });

  const showRight = state({
    transform: `translateZ(-100px) rotateY(-90deg)`,
  });

  const showBack = state({
    transform: `translateZ(-100px) rotateY(-180deg)`,
  });

  const showLeft = state({
    transform: `translateZ(-100px) rotateY(90deg)`,
  });

  const showTop = state({
    transform: `translateZ(-100px) rotateX(-90deg)`,
  });

  const showBottom = state({
    transform: `translateZ(-100px) rotateX(90deg)`,
  });

  const _animate = animate_seq_states([
    { state: showFront, duration: 0 },
    { state: showRight, duration: 1 },
    { state: showBack, duration: 1 },
    { state: showLeft, duration: 1 },
    { state: showTop, duration: 1 },
    { state: showBottom, duration: 1 },
  ], { selector: '.cube' });

  _animate(void 0, 2000);
}

export async function testAnimation() {
  // await testTransition1();
  // await testAnimation2();
  // await testAnimation3();
  await testAnimation6();
}
