/* global WebImporter */

import {
  getPathSegments,
} from './utils.js';

function fixPdfBrochure(main, results, url, locale) {
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.endsWith('.pdf')) {
      const u = new URL(href, url);
      const newPath = WebImporter.FileUtils.sanitizePath(`/assets/${locale}/${u.pathname.split('/').pop()}`);
      results.push({
        path: newPath,
        from: u.toString(),
        report: {
          redirectPdfUrl: href.toString(),
        },
      });

      a.setAttribute('href', newPath);
    }
  });
}

export default {

  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body;
    const results = [];

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'noscript',
      '#mainmenu',
      '.consent-notification',
      'h2',
      '.lightbox',
      '.entry-meta',
    ]);
    // create the metadata block and append it to the main element
    const locale = getPathSegments(params.originalURL)[0];

    const newPath = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname);
    results.push({
      element: main,
      path: newPath,
      report: {
        redirectPageFrom: params.originalURL,
        redirectPageTo: newPath,
      },
    });

    fixPdfBrochure(main, results, url, locale);
    return results;
  },
};
