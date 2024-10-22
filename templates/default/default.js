// eslint-disable-next-line no-unused-vars,no-empty-function
import { aside, section, span, div, nav } from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 800px)');

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
  const $divleft = div( { class: 'mobilemenu' });


  // Creation of Hamburger Menu
  const $hamburger = div({ class: 'ham-menu' }, span(), span(), span());

  $main.innerHTML = '';
  $divleft.append($hamburger, $aside);
  $main.append($divleft, $section);

  if (!isDesktop.matches) {
    $aside.classList.add('off-screen-menu');
    $hamburger.addEventListener('click', () => {
      $hamburger.classList.toggle('active');
      $aside.classList.toggle('active');
    });
  } 
}
