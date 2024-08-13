/* global WebImporter */

import {
  fetchAndParseDocument,
  getPathSegments, normalizeString,
} from './utils.js';

/**
 * Prefixes relative links with the target domain
 * @param {HTMLDocument} document The document
 */

const extractPageInfo = (url) => {
  return fetchAndParseDocument(url).then((doc) => {
    let desc;
    let title;
    let types = [];

    if (doc) {
      const body = doc.body;
      const content = body.querySelector('.span58');
      const categoryEl = content.querySelector('.category_description');
      if (categoryEl) { // some pages do not have title and description
        const titleEl = categoryEl.querySelector('h1');
        categoryEl.removeChild(titleEl);
        title = titleEl.textContent;
        desc = categoryEl.textContent;
      }

      const subcategories = content.querySelectorAll('.subcategories li');
      subcategories.forEach((el) => {
          const type_title = el.querySelector('a span').textContent.trim();
          const type_img = el.querySelector('a img').src;
          types.push({
            type_title,
            type_img,
          });
      });
    }
    return {
        title,
        desc,
        types,
    }
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

  transform: async ({
                      // eslint-disable-next-line no-unused-vars
                      document, url, html, params,
                    }) => {
    const main = document.body;
    const results = [];
    let type;
    let typeImage;
    let typeLabel;
    let typeDesc;
    let title;
    let titleImage;
    let titleLabel;
    let titleDesc;
    let subTitle;
    let image;
    let vocCompliantTitle = '';
    let vocCompliantDesc = '';
    let vocCompliantLabel = '';
    let compliantTypes = [];
    let subProducts;

    const result = {
      path: WebImporter.FileUtils.sanitizePath(params.originalURL),
      report: {},
    };
    const [locale, , vocCompliant, parentType, subType] = getPathSegments(params.originalURL);

    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      'noscript',
      '.consent-notification',
      '.lightbox',
      '.entry-meta',
    ]);

    // *** Extract compliant info from Accordion
    const accordion = main.querySelector('#mainmenu');
    const compliantEl = accordion.querySelector('.menu-item.active a');
    vocCompliantLabel = compliantEl.textContent.trim();
    let details = await extractPageInfo(compliantEl.href);
    vocCompliantTitle = details.title;
    vocCompliantDesc = details.desc;
    compliantTypes = details.types;

    // *** Extract submenu info from Accordion
    let subMenuEl = accordion.querySelector('.submenu-item.active.has-submenu');
    if (subMenuEl) { // has submenu
      const typeEl = subMenuEl.querySelector('a');
      typeLabel = typeEl.textContent.trim();
      titleLabel = subMenuEl.querySelector('.subsubmenu-item.active a').textContent.trim();

      let details = await extractPageInfo(typeEl.href);
      type = details.title;
      typeDesc = details.desc;
      subProducts = details.types;

      typeImage = compliantTypes.filter((t) => t.type_title === typeLabel)[0].type_img;
    } else { // no submenu
      typeLabel = accordion.querySelector('.submenu-item.active a').textContent.trim();
    }

    // *** Extract info from Product Section
    const productContainer = main.querySelector('div.span58');

    const categoryEl = productContainer.querySelector('.category_description');
    if (categoryEl && subMenuEl) { // some pages do not have title and description
      const titleEl = categoryEl.querySelector('h1');
      categoryEl.removeChild(titleEl);
      title = titleEl.textContent;
      titleDesc = categoryEl.textContent;
      titleImage = subProducts.filter((t) => t.type_title.toLowerCase() === titleLabel.toLowerCase())[0].type_img;
    } else if (categoryEl){
      const titleEl = categoryEl.querySelector('h1');
      categoryEl.removeChild(titleEl);
      type = titleEl.textContent;
      typeDesc = categoryEl.textContent;
      typeImage = compliantTypes.filter((t) => t.type_title.toLowerCase() === typeLabel.toLowerCase())[0].type_img;
    } else if (subMenuEl){
      // set images of one level above
      titleImage = subProducts.filter((t) => t.type_title.toLowerCase() === titleLabel.toLowerCase())[0].type_img;
    } else {
      typeImage = compliantTypes.filter((t) => t.type_title.toLowerCase() === typeLabel.toLowerCase())[0].type_img;
    }

    // Extract products
    productContainer.querySelectorAll('li').forEach((product) => {
      image = product.querySelector('a').href;
      const objEl = product.querySelector('.object-description');
      subTitle = objEl.querySelector('h2').textContent.trim();
      const tableEl = objEl.querySelectorAll('table tr');

      tableEl.forEach((row, i) => {
        if (i === 0) return; // skip table headers
        const cell = row.querySelector('td');
        if (cell && cell.classList && cell.classList.contains('col-more')) return; // skip 'Show More' row

        const itemNo = row.querySelector('.col-reference').textContent.trim();
        const productName = row.querySelector('.col-colour').textContent.trim();
        const perBox = row.querySelector('.col-amount').textContent.trim();
        const volume = row.querySelector('.col-content').textContent.trim();
        let code;
        const codeEl = row.querySelector('.col-code');
        if (codeEl) {
          code = codeEl.textContent.trim();
        }

        const temp = structuredClone(result);
        temp.report = {
          locale,
          parentType,
          subType,
          'voc-compliant': vocCompliant,
          'voc-compliant-title': vocCompliantTitle,
          'voc-compliant-label': vocCompliantLabel,
          'voc-compliant-desc': vocCompliantDesc,
          type,
          'type-image': typeImage,
          'type-label': typeLabel,
          'type-desc': typeDesc,
          title,
          'title-image': titleImage,
          'title-label': titleLabel,
          'title-desc': titleDesc,
          'sub-title': subTitle,
          'item-nr': itemNo,
          code,
          'product-name': productName,
          'per-box': perBox,
          volume,
          image,
        };
        results.push(temp);
      });
    });

    // perform cleanup for an optimized excel
    results.forEach((result, i) => {
      if (i != 0 && result.report['voc-compliant-desc']) {
        delete result.report['voc-compliant-desc'];
      }
      if (i != 0 && result.report['type-desc']) {
        delete result.report['type-desc'];
      }
      if (i != 0 && result.report['title-desc']) {
        delete result.report['title-desc'];
      }
    });

    // fetch unique images and collect for download
    const uniqueImages = new Set();
    results.forEach((result) => {
      if (result.report && result.report.image) {
        uniqueImages.add(result.report.image);
      }
      if (result.report && result.report['type-image']) {
        uniqueImages.add(result.report['type-image']);
      }
      if (result.report && result.report['title-image']) {
        uniqueImages.add(result.report['title-image']);
      }
    });

    // Add images for download
    uniqueImages.forEach((image) => {
      const imgDownload = {
        path: `/imgassets/${image.split('/').pop()}`,
        from: image.toString(),
        report: {
          'img-new-sp': `/imgassets/${image.split('/').pop()}`,
          'img-original': image.toString(),
        },
      };
      results.push(imgDownload);
    });

    // Add entry in excel for page redirect
    results.push({
      path: '/dummy',
      report: {
        'url-redirect-from': params.originalURL,
        'url-redirect-to': `/${locale}/products/${vocCompliant}/${subType ? normalizeString(type + '/' + title) : normalizeString(type)}`,
      }
    });
    return results;

  },
};
