// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $main = doc.querySelector('main');
  const $mainChildren = Array.from($main.childNodes);
  const $section = section();

  $mainChildren.forEach((child) => {
    $section.appendChild(child);
  });

  const asideNavFrag = await loadFragment('/aside-nav');
  const $asideNav = asideNavFrag.querySelector('.aside-nav-wrapper').cloneNode(true);
  const $aside = aside($asideNav);

  $main.innerHTML = '';
  $main.append($aside, $section);
}
