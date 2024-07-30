// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main');
  const $content = $page.querySelector(':scope > div');

  const lefNavFrag = await loadFragment('/drafts/Meet/en/products/leftdiv');
  const $leftNav = lefNavFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $section = section(
    $content,
  );

  const $aside = aside(
    $leftNav,
  );

  $page.replaceWith($section, $aside);
}
