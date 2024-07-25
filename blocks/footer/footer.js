/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import getPathSegment from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';
import { div, strong, p, a, img, br } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const locale = getPathSegment(0);
  const footerFrag = await loadFragment(`/${locale}/footer`);

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
      img({ src: '/icons/facebook.png', alt: 'Facebook' })),
    a({ href: 'https://www.instagram.com/officialoctoral/', target: '_blank' },
      img({ src: '/icons/instagram.png', alt: 'Instagram' })),
    a({ href: 'https://www.youtube.com/channel/UC5u6bn-tunxcManO-1OGiKw', target: '_blank' },
      img({ src: '/icons/youtube.png', alt: 'YouTube' })),
  );

  const $terms = div({ class: 'terms' },
    a({ href: 'https://www.valsparauto.com', target: '_blank' }, img({ src: '/icons/valspar-logo.png', alt: 'Valspar logo' })),
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
