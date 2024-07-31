// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $content = $page.querySelector(':scope > div');
  const navFrag = await loadFragment(`/aside-nav`);
  const $asideNav = navFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $aside = aside(
    $asideNav,
  );

  const $section = section(
    $content,
  );

  $page.append($aside, $section);
}
