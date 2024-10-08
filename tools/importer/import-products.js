/* global WebImporter */

import {
  fetchAndParseDocument, fixImageLinks,
  getPathSegments, normalizeString,
} from './utils.js';

/**
 * Prefixes relative links with the target domain
 * @param {HTMLDocument} document The document
 */

const extractPageInfo = (url) => fetchAndParseDocument(url).then((doc) => {
  let desc;
  let title;
  const types = [];

  if (doc) {
    const { body } = doc;
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
      const typeTitle = el.querySelector('a span').textContent.trim();
      const typeImg = el.querySelector('a img').src;
      types.push({
        typeTitle,
        typeImg,
      });
    });
  }
  return {
    title,
    desc,
    types,
  };
});

function optimizeExcel(results) {
  const keys = ['voc-compliant', 'voc-compliant-title', 'voc-compliant-label', 'voc-compliant-desc',
    'type', 'type-image', 'type-label', 'type-desc',
    'title', 'title-image', 'title-label', 'title-desc'];

  results.forEach((obj, i) => {
    keys.forEach((key) => {
      if (i !== 0 && obj.report[key]) {
        delete obj.report[key];
      }
    });
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
    const [locale, , vocCompliant, , , subType] = getPathSegments(params.originalURL);

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

    ({
      title: vocCompliantTitle,
      desc: vocCompliantDesc,
      types: compliantTypes,
    } = await extractPageInfo(compliantEl.href));

    // *** Extract submenu info from Accordion
    const subMenuEl = accordion.querySelector('.submenu-item.active.has-submenu');
    if (subMenuEl) { // has submenu
      const typeEl = subMenuEl.querySelector('a');
      typeLabel = typeEl.textContent.trim();
      titleLabel = subMenuEl.querySelector('.subsubmenu-item.active a').textContent.trim();

      ({ title: type, desc: typeDesc, types: subProducts } = await extractPageInfo(typeEl.href));

      typeImage = compliantTypes.filter((t) => t.typeTitle === typeLabel)[0].type_img;
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
      titleImage = subProducts.filter(
        (t) => t.typeTitle.toLowerCase() === titleLabel.toLowerCase(),
      )[0].typeImg;
    } else if (categoryEl) {
      const titleEl = categoryEl.querySelector('h1');
      categoryEl.removeChild(titleEl);
      type = titleEl.textContent;
      typeDesc = categoryEl.textContent;
      typeImage = compliantTypes.filter(
        (t) => t.typeTitle.toLowerCase() === typeLabel.toLowerCase(),
      )[0].typeImg;
    } else if (subMenuEl) {
      // set images of one level above
      titleImage = subProducts.filter(
        (t) => t.typeTitle.toLowerCase() === titleLabel.toLowerCase(),
      )[0].typeImg;
    } else {
      typeImage = compliantTypes.filter(
        (t) => t.typeTitle.toLowerCase() === typeLabel.toLowerCase(),
      )[0].typeImg;
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
          'voc-compliant': vocCompliant,
          'voc-compliant-title': vocCompliantTitle,
          'voc-compliant-label': vocCompliantLabel.toUpperCase(),
          'voc-compliant-desc': vocCompliantDesc,
          type,
          'type-image': typeImage,
          'type-label': typeLabel.toUpperCase(),
          'type-desc': typeDesc,
          title,
          'title-image': titleImage,
          'title-label': titleLabel ? titleLabel.toUpperCase() : titleLabel,
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
    optimizeExcel(results);

    // fetch unique images and collect for download
    const uniqueImages = new Map();
    results.forEach((obj) => {
      const addImage = (originalImagePath) => {
        if (!uniqueImages.has(originalImagePath)) {
          uniqueImages.set(originalImagePath, fixImageLinks(originalImagePath));
        }
      };

      if (obj.report && obj.report.image) {
        addImage(obj.report.image);
        obj.report.image = obj.report.image.split('/').pop();
      }
      if (obj.report && obj.report['type-image']) {
        addImage(obj.report['type-image']);
        obj.report['type-image'] = obj.report['type-image'].split('/').pop();
      }
      if (obj.report && obj.report['title-image']) {
        addImage(obj.report['title-image']);
        obj.report['title-image'] = obj.report['title-image'].split('/').pop();
      }
    });

    uniqueImages.forEach((v, k) => {
      const imgDownload = {
        path: new URL(v.toString()).pathname,
        from: k.toString(),
        report: {
          'img-new-sp': v,
          'img-original': k,
        },
      };
      results.push(imgDownload);
    });

    // Add entry in excel for page redirect
    results.push({
      path: '/dummy',
      report: {
        'url-redirect-from': params.originalURL,
        'url-redirect-to': `/${locale}/products/${vocCompliant}/${subType ? normalizeString(`${type}/${title}`) : normalizeString(type)}`,
      },
    });
    return results;
  },
};
