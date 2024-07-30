// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';
import getPathSegments from '../../scripts/utils.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $content = $page.querySelector(':scope > div');
  const [locale] = getPathSegments();
  const lefNavFrag = await loadFragment(`/${locale}/aside-nav`);
  const $leftNav = lefNavFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $aside = aside(
    $leftNav,
  );

  const $section = section(
    $content,
  );

  $page.append($aside, $section);
}
