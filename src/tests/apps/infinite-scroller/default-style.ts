import { AttachNode } from '../../../core/custom-node/node-state-observable/mutations';

export function LoadDefaultInfiniteScrollerStyle(): HTMLStyleElement {
  const style: HTMLStyleElement = document.createElement('style');
  style.textContent = `
      infinite-scroller {
        display: block;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      
      infinite-scroller[direction="vertical"] {
      }
      
      infinite-scroller[direction="horizontal"] {
      }
      
      infinite-scroller[direction="vertical"] > * { /* .container */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="vertical"] > * > * { /* .chunk */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="vertical"] > * > * > * { /* element */
        display: block;
        width: 100%;
      }
      
      infinite-scroller[direction="horizontal"] > * { /* .container */
        display: inline-block;
        vertical-align: top;
        height: 100%;
        white-space: nowrap;
      }
      
      infinite-scroller[direction="horizontal"] > * > * { /* .chunk */
        display: inline-block;
        vertical-align: top;
        height: 100%;
        white-space: nowrap;
      }
      
      infinite-scroller[direction="horizontal"] > * > * > * { /* element */
        display: inline-block;
        vertical-align: top;
        height: 100%;
      }
    `;

  AttachNode(style, document.head);

  return style;
}
