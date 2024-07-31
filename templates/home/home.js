// eslint-disable-next-line no-unused-vars,no-empty-function
import { div, aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {

  console.log('doc',doc);
  const $main = doc.querySelector('main');
  const $sectionLeft = $main.querySelector('.section.left');
  const $sectionRight = $main.querySelector('.section.right');

  const navFrag = await loadFragment(`/aside-nav`);
  const $asideNav = navFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $home = div(
    section(
      $sectionLeft,
      $sectionRight,
    ),
    aside(
      $asideNav,
    ),
  );

  $main.append($home);
}
