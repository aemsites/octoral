// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import getPathSegments from '../../scripts/utils.js';

export default async function decorate(doc) {
  // extends default template
  await loadTemplate(doc, 'default');

  // get path segments for use in product display logic
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  console.log('locale:', locale);
  console.log('products:', products);
  console.log('vocCompliant:', vocCompliant);
  console.log('type:', type);
  console.log('title:', title);
}
