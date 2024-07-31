// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';

export default async function decorate(doc) {
  // extends default template
  await loadTemplate(doc, 'default');
  doc.body.classList.add('home');
}
