import { Color } from './implementation';
import { IColor } from './interfaces';

function createDummyElement(): HTMLDivElement {
  const element: HTMLDivElement = document.createElement('div');
  element.style.width = '100px';
  element.style.height = '10px';
  return element;
}


async function debugColorParse() {
  [
    'invalid',
    'red',
    'rgb(255, 0, 0)',
    'rgba(255, 0, 0, 0.5)',
    'hsl(0, 100%, 50%)', // red
    'hsla(0, 100%, 50%, 0.5)', // red
  ].forEach((color: string) => {
    const _color = Color.parse(color);
    console.warn(color);
    if (_color === null) {
      console.log('null');
    } else {
      console.log(_color.toRGBA());
      console.log(_color.toHSLA());
      console.log(_color.toHex());
      console.log(_color.toHSLAObject());
    }
  });
}

async function debugColorMix() {
  const c1: IColor = Color.parse('red') as IColor;
  const c2: IColor = Color.parse('green') as IColor;

  for (let i = 0, l = 100; i <= l; i++) {
    const elt = createDummyElement();
    elt.style.backgroundColor = c1.mix(c2, i / l).toRGBA();
    document.body.appendChild(elt);
  }
}

export async function debugColor() {
  // await debugColorParse();
  await debugColorMix();
}
