// eslint-disable-next-line no-unused-vars,no-empty-function
import { div, h3, } from '/scripts/dom-helpers.js';

export default async function decorate(doc) {
  console.log('doc element can be manipulated just like blocks', doc);

  // get h1 tag from doc and change it to h3 using domhelpers
  const h1 = doc.querySelector('h1');
  if (h1) {
    h1.replaceWith(h3(h1.textContent));
  }

}
