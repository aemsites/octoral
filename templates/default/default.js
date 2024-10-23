// eslint-disable-next-line no-unused-vars,no-empty-function
import {
  aside, section, span, div,
} from '../../scripts/dom-helpers.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 800px)');
let $aside = '';
let $hamburger = '';

const mobileAction = function() {
    $aside.classList.add('off-screen-menu');
    $hamburger.addEventListener('click', () => {
      console.log($hamburger);
      $hamburger.classList.toggle('active');
      console.log($hamburger);
      $aside.classList.toggle('active');
    });
}

const resizeAction = function () {
  if (isDesktop.matches) {
    if ($aside.classList.contains('off-screen-menu')) {
      $aside.classList.remove('off-screen-menu');
    }
    if ($hamburger.classList.contains('active')) {
      $hamburger.classList.remove('active');
    }
    if ($aside.classList.contains('active')) {
      $aside.classList.remove('active');
    }
  } else {
    mobileAction();
  }
}

export default async function decorate(doc) {
  const $main = doc.querySelector('main');
  const $mainChildren = Array.from($main.childNodes);
  const $section = section();

  $mainChildren.forEach((child) => {
    $section.appendChild(child);
  });

  const asideNavFrag = await loadFragment('/aside-nav');
  const $asideNav = asideNavFrag.querySelector('.aside-nav-wrapper').cloneNode(true);
  $aside = aside($asideNav);
  const $divleft = div({ class: 'mobilemenu' });

  // Creation of Hamburger Menu
  $hamburger = div({ class: 'ham-menu' }, span(), span(), span());

  $main.innerHTML = '';
  $divleft.append($hamburger, $aside);
  $main.append($divleft, $section);

  if (!isDesktop.matches) {
    mobileAction();
  }
  window.addEventListener('resize', resizeAction);
}
