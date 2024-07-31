/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */

import {
  createMetadata, fixRelativeLinks,
} from './utils.js';

/**
 * Prefixes relative links with the target domain
 * @param {HTMLDocument} document The document
 */

function fixBrochure(main) {
  const newsArticle = main.querySelector('.block-newsarticle section article');
  if (newsArticle && newsArticle.querySelector('.entry-content p img[alt="Download Button"]')) {
    const brochureImages = newsArticle.querySelectorAll('.entry-content p img[alt="Download Button"]');
    if (brochureImages) {
      brochureImages.forEach((brochureImage) => {
        const parent = brochureImage.parentNode;
        if (parent.nodeName === 'A') {
          const brochureLink = parent;
          brochureLink.textContent += '[class=download-button]';
        }
      });
    }
  }

  if (newsArticle && newsArticle.querySelector('.entry-content p a[href$=".pdf"]')) {
    const brochureLinks = newsArticle.querySelectorAll('.entry-content p a[href$=".pdf"]');
    if (brochureLinks) {
      brochureLinks.forEach((brochureLink) => {
        const fileName = new URL(brochureLink.href).pathname.split('/').pop();
        brochureLink.setAttribute('href', `/assets/${fileName}`);
      });
    }
  }
}

function handleTable(main, document) {
  const temp = main.querySelectorAll('table');
  temp.forEach((t) => {
    const cells = [[t.cloneNode(true)]];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    t.replaceWith(table);
  });
}

export default {
  /**
     * Apply DOM operations to the provided document and return
     * the root element to be then transformed to Markdown.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @returns {HTMLElement} The root element to be transformed
     */
  preprocess: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const newsArticle = document.querySelector('.block-newsarticle section article');
    const fields = {};
    let brochureLink;
    if (newsArticle) {
      fields.newsTitle = newsArticle.querySelector('h1')?.textContent.trim().toUpperCase();
      fields.publishDateTime = newsArticle.querySelector('.entry-meta .published')?.getAttribute('title');
      fields.publishDate = newsArticle.querySelector('.entry-meta .published')?.innerHTML.trim();
      fields.updatedDateTime = newsArticle.querySelector('.entry-meta .updated')?.innerHTML.trim();

      if (newsArticle.querySelector('.entry-content p:last-of-type a') != null) {
        brochureLink = newsArticle.querySelector('.entry-content p:last-of-type a')?.getAttribute('href');
        fields.brochureText = newsArticle.querySelector('.entry-content p:last-of-type a')?.textContent;
      }
    }

    if (brochureLink) {
      /* figure if we should download PDF  in importer or write utility seperately
            fetchNewsBrochure(brochureLink, "/pdf/" +  (new URL(brochureLink).pathname));
            */
    }
    fields.template = 'news';
    params.preProcessMetadata = fields;
  },

  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.body;

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

    handleTable(main, document);
    createMetadata(main, document, params);
    fixBrochure(main);
    fixRelativeLinks(main);
    return main;
  },

  /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @return {string} The path
     */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const { pathname } = new URL(url);
    const initialReplace = new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '');

    console.log(`pathname: ${pathname} -> initialReplace: ${initialReplace}`);
    return WebImporter.FileUtils.sanitizePath(initialReplace);
  },
};
