// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import { normalizeString, getPathSegments, sanitizePath } from '../../scripts/utils.js';
import {
  div, h1, p, a, h2,
} from '../../scripts/dom-helpers.js';
import {
  createOptimizedPicture, buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';

function normalizeImage(str) {
  const imagePath = '/drafts/akasjain/assets/';
  return sanitizePath(imagePath + str);
}

class Obj {
  // eslint-disable-next-line max-len
  constructor(type, typeimage, typelabel, image, href, label, desc, feedType, title, titleimage, titlelabel, subtitle, itemnr, perbox, volume, code, productname) {
    this.type = type;
    this.typeimage = typeimage;
    this.typelabel = typelabel;
    this.image = image;
    this.href = href;
    this.label = label;
    this.desc = desc;
    this.feedType = feedType;
    this.title = title;
    this.titleimage = titleimage;
    this.titlelabel = titlelabel;
    this.subtitle = subtitle;
    this.itemnr = itemnr;
    this.perbox = perbox;
    this.volume = volume;
    this.code = code;
    this.productname = productname;
  }
}

// Grouping by subtitle for Used Cases 2 & 4
const groupBy = (array, key) => array.reduce((accum, current) => {
  if (!accum[current[key]]) {
    accum[current[key]] = [];
  }
  accum[current[key]].push(current);
  return accum;
}, {});

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: (results, value) => {
    const blockContents = [];
    results.forEach((result) => {
      const row = [];
      const cardBody = div();
      const cardImage = createOptimizedPicture(result[`${value}image`]);
      const divTitle = div({ class: 'title' });
      divTitle.textContent = result[`${value}`];
      const path = a();
      path.href = window.location.origin + result.href;
      path.append(divTitle);
      cardBody.appendChild(path);
      row.push(cardBody);

      if (cardImage) {
        const pathImg = a();
        pathImg.href = window.location.origin + result.href;
        pathImg.append(cardImage);
        row.push(pathImg);
      }
      blockContents.push(row);
    });
    return blockContents;
  },

  productstable: (results) => {
    const blockContents = [];
    const row = [];

    const trowhead = div();
    const cellhead1 = div({ class: 'heading' }, 'Item nr.');
    trowhead.append(cellhead1);
    const cellhead2 = div({ class: 'heading' }, 'Code');
    trowhead.append(cellhead2);
    const cellhead3 = div({ class: 'heading' }, 'Product name');
    trowhead.append(cellhead3);
    const cellhead4 = div({ class: 'heading' }, 'Per box');
    trowhead.append(cellhead4);
    const cellhead5 = div({ class: 'heading' }, 'Volume');
    trowhead.append(cellhead5);
    results.forEach((result) => {
      const trow = div();
      const createCell = (data, className, heading) => {
        if (data) {
          const cell = div({ class: className });
          cell.textContent = data;
          trow.append(cell);
        } else {
          heading.remove();
        }
      };
      createCell(result.itemnr, 'data', cellhead1);
      createCell(result.code, 'data', cellhead2);
      createCell(result.productname, 'data', cellhead3);
      createCell(result.perbox, 'data', cellhead4);
      createCell(result.volume, 'data', cellhead5);

      row.push(trowhead);
      row.push(trow);
    });

    blockContents.push(row);
    return blockContents;
  },
};

// Checking 4th used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system/octobase_system_mixing_colours
const tillTitle = (data, vocCompliant, type, title, locale) => {
  const endResult = [];
  const fieldset = `${vocCompliant}|${type}|${title}`;

  const typeEntry = data.filter((entry) => entry.field === `${vocCompliant}|${type}`)[0];
  const subType = data.filter((entry) => entry.field === fieldset)[0];
  const products = data.filter((entry) => entry.fieldset === fieldset);

  products.forEach((product) => {
    const obj = new Obj(
      typeEntry.type,
      normalizeImage(typeEntry['type-image']),
      typeEntry['type-label'],
      normalizeImage(product.image),
      `/${locale}/products/${vocCompliant}/${normalizeString(typeEntry.type)}/${normalizeString(typeEntry.title)}`,
      null,
      subType['title-desc'],
      'stage4-table',
      subType['title-label'],
      normalizeImage(subType['title-image']),
      subType.title,
      product['sub-title'],
      product['item-nr'],
      product['per-box'],
      product.volume,
      product.code,
      product['product-name'],
    );
    endResult.push(obj);
  });
  return endResult;
};

// Checking 2nd used case - https://www.octoral.com/en/products/non-voc/cleaning_agents
const tillType = (data, vocCompliant, type, locale) => {
  const endResult = [];
  const fieldset = `${vocCompliant}|${type}`;

  const typeEntry = data.filter((entry) => entry.field === fieldset)[0];
  const products = data.filter((entry) => entry.fieldset === fieldset);
  const areSubProducts = products.some((entry) => entry.field !== '');

  if (!areSubProducts) { // usecase-2
    products.forEach((product) => {
      const obj = new Obj(
        typeEntry.type,
        normalizeImage(typeEntry['type-image']),
        typeEntry['type-label'],
        normalizeImage(product.image),
        `/${locale}/products/${vocCompliant}/${normalizeString(typeEntry.type)}`,
        typeEntry['type-label'],
        typeEntry['type-desc'],
        'stage2-table',
        null,
        null,
        null,
        product['sub-title'],
        product['item-nr'],
        product['per-box'],
        product.volume,
        product.code,
        product['product-name'],
      );
      endResult.push(obj);
    });
  } else { // usecase-3
    products.forEach((product) => {
      const obj = new Obj(
        typeEntry.type,
        normalizeImage(typeEntry['type-image']),
        typeEntry['type-label'],
        normalizeImage(product.image),
        `/${locale}/products/${vocCompliant}/${normalizeString(typeEntry.type)}/${normalizeString(product['title-label'])}`,
        typeEntry['type-label'],
        typeEntry['type-desc'],
        'stage3-card',
        product.title,
        normalizeImage(product['title-image']),
        product['title-label'],
      );
      endResult.push(obj);
    });
  }

  return endResult;
};

// Checking 1st used case - https://www.octoral.com/en/products/non-voc/
const tillVocCompliant = (data, vocCompliant, locale) => {
  const endResult = [];

  const entry = data.filter((e) => e.field === vocCompliant)[0];
  const types = data.filter((e) => e.fieldset === vocCompliant);
  types.forEach((type) => {
    const obj = new Obj(
      type.type,
      normalizeImage(type['type-image']),
      type['type-label'],
      null,
      `/${locale}/products/${vocCompliant}/${normalizeString(type.type)}`,
      entry['voc-compliant-label'],
      entry['voc-compliant-desc'],
      'stage1-card',
    );
    endResult.push(obj);
  });
  return endResult;
};

async function fetchProducts(vocCompliant, type, title, locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'products';

  await window.placeholders;
  const json = window.placeholders[`${TRANSLATION_KEY}`][`${locale}`];

  let endResult;
  if (typeof type === 'undefined' && typeof title === 'undefined') {
    endResult = tillVocCompliant(json.data, vocCompliant, locale);
  }

  if (typeof type !== 'undefined' && typeof title === 'undefined') {
    endResult = tillType(json.data, vocCompliant, type, locale);
  }

  if (typeof title !== 'undefined') {
    endResult = tillTitle(json.data, vocCompliant, type, title, locale);
  }
  return endResult;
}

export default async function decorate(doc) {
  // extends default template
  await loadTemplate(doc, 'default');
  const $section = doc.querySelector('section');
  let $products = div();

  // get path segments for use in product display logic
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  const result = await fetchProducts(vocCompliant, type, title, locale, products);

  // Taking care of the 1st & 3rd used cases
  const usedCase = result[0].feedType;
  if (usedCase === 'stage1-card' || usedCase === 'stage3-card') {
    $products = div(
      h1(`${result[0].label}`),
      p(`${result[0].desc}`),
    );
    const blockType = 'cards';
    result.sort((x, y) => x.type - y.type);
    const blockContents = usedCase === 'stage1-card' ? resultParsers[blockType](result, 'type') : resultParsers[blockType](result, 'title');
    const builtBlock = buildBlock(blockType, blockContents);
    const parentDiv = div(
      builtBlock,
    );
    $section.append($products);
    $section.append(parentDiv);
    decorateBlock(builtBlock);
    await loadBlock(builtBlock);
    builtBlock.classList.add('products');
  }

  // Taking care of the 2nd & 4th used cases
  if (usedCase === 'stage2-table' || usedCase === 'stage4-table') {
    $products = usedCase === 'stage2-table' ? div(
      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    ) : div(
      h1(`${result[0].titlelabel}`),
      p(`${result[0].desc}`),
    );

    const blockType = 'productstable';
    $section.append($products);
    result.sort((x, y) => x.subtitle - y.subtitle);
    const subtitleArray = groupBy(result, 'subtitle');
    Object.keys(subtitleArray).forEach(async (key) => {
      const productImage = createOptimizedPicture(subtitleArray[key][0].image);
      subtitleArray[key].sort((x, y) => x.itemnr - y.itemnr);
      const blockContents = resultParsers[blockType](subtitleArray[key]);
      const builtBlock = buildBlock(blockType, blockContents);
      const productName = h2(key);
      const parentDiv = div(
        productName,
        builtBlock,
      );
      const mainDiv = div(
        { class: 'product-info' },
        productImage,
        parentDiv,
      );
      $section.append(mainDiv);
      decorateBlock(builtBlock);
      await loadBlock(builtBlock);
    });
  }
}
