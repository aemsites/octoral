/* global WebImporter */

import {
  getPathSegments,
} from './utils.js';

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

    const newPath = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname);
    results.push({
      element: main,
      path: newPath,
      report: {
        redirectPageFrom: params.originalURL,
        redirectPageTo: newPath,
      },
    });

    return results;
  },
};
