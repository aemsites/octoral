// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $content = $page.querySelector('.default-content-wrapper');

  const lefNavFrag = await loadFragment('/drafts/Meet/en/products/leftdiv');
  const $leftNav = lefNavFrag.querySelector('.accordion-wrapper').cloneNode(true);

  const $aside = aside(
    $leftNav,
  );

  const $section = section(
    $content,
  );

  $page.append($aside, $section);
}
