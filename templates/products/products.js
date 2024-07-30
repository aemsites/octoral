// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section, p } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import getPathSegments from '../../scripts/utils.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $content = $page.querySelector('.default-content-wrapper');
  // eslint-disable-next-line no-unused-vars
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  const lefNavFrag = await loadFragment(`/drafts/Meet/${locale}/products/leftdiv`);
  const $leftNav = lefNavFrag.querySelector('.accordion-wrapper').cloneNode(true);

  const $aside = aside(
    $leftNav,
  );

  const $section = section(
    $content,
    p(`locale = ${locale}`),
    p(`vocCompliant = ${vocCompliant}`),
    p(`type = ${type}`),
    p(`title = ${title}`),
    p('get data from products.json & display here'),
  );

  $page.append($aside, $section);
}
