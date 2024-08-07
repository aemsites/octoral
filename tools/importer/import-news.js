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
  createMetadata,
} from './utils.js';

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map((num) => {
    const hex = parseInt(num, 10).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  });
  return `#${result.join('')}`;
}

function filterElementByStyleValue(element, styleProp = 'color', value = '#00ccff') {
  const rgbColor = element.style[styleProp];
  if (rgbColor) {
    return rgbToHex(rgbColor) === value;
  }
  return false;
}

function filterElementsByStyleValue(elements, styleProp = 'color', value = '#00ccff') {
  const filteredEls = [];
  elements.forEach((el) => {
    if (filterElementByStyleValue(el, styleProp, value)) {
      filteredEls.push(el);
    }
  });
  return filteredEls;
}

function fixHeadings(main) {
  const headings = [];

  // Certain inline headings are placed in strong > span
  headings.push(...filterElementsByStyleValue(main.querySelectorAll('p strong span')));

  // Certain inline headings are placed in span > strong
  Array.from(main.querySelectorAll('p span strong')).forEach((el) => {
    if (filterElementByStyleValue(el.parentElement)) {
      headings.push(el);
    }
  });

  if (headings) {
    headings.forEach((el) => {
      const h3El = document.createElement('h3');
      h3El.innerText = el.textContent.trim();
      el.parentElement.replaceWith(h3El);
      const closestP = h3El.closest('p');
      if (closestP) {
        [...closestP.children].forEach((f) => {
          if (f.nodeName === 'BR') {
            f.remove();
          }
        });
      }
    });
  }
}

function fixPdfBrochure(main, results, url) {
  const newsArticle = main.querySelector('.block-newsarticle section article');
  if (newsArticle && newsArticle.querySelector('.entry-content p img[alt="Download Button"]')) {
    const brochureImages = newsArticle.querySelectorAll('.entry-content p img[alt="Download Button"]');
    if (brochureImages) {
      brochureImages.forEach((brochureImage) => {
        const aEl = brochureImage.closest('a');
        aEl.textContent = 'Download [class:button download]';
      });
    }
  }

  // find pdf links
  main.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.endsWith('.pdf')) {
      const u = new URL(href, url);
      const newPath = WebImporter.FileUtils.sanitizePath(`/assets/${u.pathname.split('/').pop()}`);
      results.push({
        path: newPath,
        from: u.toString(),
        report: {
          redirectPdfUrl: href.toString(),
        },
      });

      const newHref = new URL(newPath, 'https://main--octoral--aemsites.hlx.page').toString();
      a.setAttribute('href', newHref);
    }
  });
}

function handleTable(main, document) {
  const temp = main.querySelectorAll('table');

  temp.forEach((t) => {
    const cells = [['table']];
    t.cloneNode(true).querySelectorAll('tr').forEach((row) => {
      const x = [];
      row.querySelectorAll('td').forEach((cell) => {
        if (cell.querySelector('strong')) {
          x.push(`<strong>${cell.textContent}</strong>`);
        } else {
          x.push(cell.textContent);
        }
      });
      cells.push(x);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    t.replaceWith(table);
  });
}

function fixImage(main) {
  const heroImage = main.querySelector('img:first-of-type');
  if (heroImage) {
    const ul = heroImage.closest('ul');
    if (ul) {
      ul.replaceWith(heroImage);
    }
  }
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
    if (newsArticle) {
      fields.newsTitle = newsArticle.querySelector('h1')?.textContent.trim().toUpperCase();
      fields.publishDateTime = newsArticle.querySelector('.entry-meta .published')?.getAttribute('title');
      fields.publishDate = newsArticle.querySelector('.entry-meta .published')?.innerHTML.trim();
      fields.updatedDateTime = newsArticle.querySelector('.entry-meta .updated')?.innerHTML.trim();

      if (newsArticle.querySelector('.entry-content p:last-of-type a') != null) {
        fields.brochureText = newsArticle.querySelector('.entry-content p:last-of-type a')?.textContent;
      }
    }
    params.preProcessMetadata = fields;
  },

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

    results.push({
      element: main,
      path: WebImporter.FileUtils.sanitizePath(params.originalURL),
      report: {
        redirectPageUrl: params.originalURL,
      },
    });

    fixImage(main);
    handleTable(main, document);
    fixPdfBrochure(main, results, url);
    fixHeadings(main);
    createMetadata(main, document, params);
    return results;
  },
};
