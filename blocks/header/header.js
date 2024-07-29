/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import getPathSegments from '../../scripts/utils.js';
import { div, nav, form, input, a, img, li, ul } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const [locale] = getPathSegments();
  // supported languages
  const languages = [
    { code: 'us', label: 'USA' },
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
  ];

  const $homeBtn = a({ class: 'home', href: `/${locale}/` }, img({ src: '/icons/home.png', width: 16, height: 16, alt: 'Back to home' }));

  const $topBar = div({ class: 'top-bar' },
    (getPathSegments().length > 1) ? $homeBtn : '',
    div({ class: 'search' },
      form({ method: 'get', action: `/${locale}/search` },
        input({ type: 'text', name: 'query', title: 'Search...', placeholder: 'Search...' }),
      ),
    ),
    nav(
      ul(
        ...languages.map(({ code, label }) => li({ class: `${code === locale ? 'active' : ''}` },
          a({ href: `/${code}/`, title: label },
            img({ src: `/icons/flag-${code}.png`, width: 16, height: 11, alt: label }),
          ),
        )),
      ),
    ),
  );

  const $logo = div({ class: 'logo' },
    img({ src: '/icons/octoral-header.png', width: 1030, height: 230, alt: 'Octoral logo' }),
  );

  block.replaceWith($topBar, $logo);
}
