// eslint-disable-next-line no-unused-vars,no-empty-function
import { h3 } from '../../scripts/dom-helpers.js';

export default async function decorate(doc) {
  // doc is an object, just like a block

  // get h1 tag from doc and change it to h3 using domhelpers
  const h1 = doc.querySelector('h1');
  if (h1) {
    h1.replaceWith(h3(h1.textContent));
  }
}
