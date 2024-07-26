/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import getPathSegment from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';
import { div, strong, p, a, img, br } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const locale = getPathSegment(0);
  const validLocales = ['us', 'en', 'nl', 'de', 'fr', 'it', 'es'];
  // if the locale is not valid, default to 'us'
  const selectedLocale = validLocales.includes(locale) ? locale : 'us';
  const footerFrag = await loadFragment(`/${selectedLocale}/footer`);

  const $vcard = div({ class: 'vcard' },
    strong('Valspar b.v.'),
    br(),
    'Tel.: +31 (0)320 292200',
    br(),
    'Fax.: +31 (0)320 292201',
    br(),
    'E-mail: ',
    a({ href: 'mailto:info.nl@valspar.com' }, 'info.nl@valspar.com'),
  );

  const $links = div({ class: 'links' },
    footerFrag ? footerFrag.querySelector('.default-content-wrapper') : '',
  );

  const $social = div({ class: 'social' },
    a({ href: 'https://www.facebook.com/officialoctoral', target: '_blank' },
      img({ src: '/icons/facebook.png', width: 32, height: 23, alt: 'Facebook' })),
    a({ href: 'https://www.instagram.com/officialoctoral/', target: '_blank' },
      img({ src: '/icons/instagram.png', width: 32, height: 23, alt: 'Instagram' })),
    a({ href: 'https://www.youtube.com/channel/UC5u6bn-tunxcManO-1OGiKw', target: '_blank' },
      img({ src: '/icons/youtube.png', width: 32, height: 23, alt: 'YouTube' })),
  );

  const $terms = div({ class: 'terms' },
    a({ href: 'https://www.valsparauto.com', target: '_blank' },
      img({ src: '/icons/valspar-logo.png', width: 212, height: 35, alt: 'Valspar logo' })),
    p(
      'Copyright © 2024 Valspar b.v. and The',
      br(),
      'Sherwin-Williams Company. All rights reserved.',
    ),
    p(
      a({ href: 'https://privacy.sherwin-williams.com/', target: '_blank' }, 'Privacy Policy'),
      ' - ',
      a({ href: 'https://www.sherwin-williams.com/terms-of-use', target: '_blank' }, 'Terms of Use'),
      ' - ',
      a({ href: `/${locale}/cookie_settings` }, 'Cookie Settings'),
    ),
  );

  block.replaceWith($vcard, $links, $social, $terms);
}
