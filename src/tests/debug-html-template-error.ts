import { HTMLTemplateError } from '../core/template/HTMLTemplateError';

export function debugHTMLTemplateError() {
  const template = `
    <!--abc-->
    <div class="a">a_in_text</div>
    a_text
    <div class="b">
      <div class="b_in" onclick="console.log('click')">
        b_in_text
      </div>
    </div>
    b_text
    <div class="c">c_in_text</div>
  `;

  document.body.innerHTML = template;
  console.log(document.body.innerHTML);

  const element: Element = document.querySelector('.b_in') as Element;
  const attribute: Attr = element.getAttributeNode('onclick') as Attr;

  // const range: [number, number] = GetCharacterRangeOfNode(element, document.body);
  // console.log(range);
  // console.log(new HTMLTemplateError('missing attribute', document.body.innerHTML, ...range));
  // console.log(HTMLTemplateError.fromElement('missing attribute', element, document.body));
  console.error(HTMLTemplateError.fromAttribute('missing attribute', attribute, document.body));
}
