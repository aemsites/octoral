// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import getPathSegments from '../../scripts/utils.js';
import { div, h1, p } from '../../scripts/dom-helpers.js';
import {
  createOptimizedPicture, buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';

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

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: (results, value) => {
    const blockContents = [];
    results.forEach((result) => {
      const row = [];
      const cardBody = document.createElement('div');
      const cardImage = createOptimizedPicture(result[`${value}image`]);
      const divTitle = document.createElement('div');
      divTitle.classList.add('title');
      divTitle.textContent = result[`${value}`];
      const path = document.createElement('a');
      path.href = window.location.origin + result.href;
      path.append(divTitle);
      cardBody.appendChild(path);
      row.push(cardBody);

      if (cardImage) {
        const pathImg = document.createElement('a');
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

    // const thead = document.createElement('div');
    const trowhead = document.createElement('div');
    const cellhead1 = document.createElement('div');
    cellhead1.textContent = 'Item nr';
    cellhead1.classList.add('heading');
    trowhead.append(cellhead1);
    const cellhead2 = document.createElement('div');
    cellhead2.textContent = 'Code';
    cellhead2.classList.add('heading');
    trowhead.append(cellhead2);
    const cellhead3 = document.createElement('div');
    cellhead3.textContent = 'Product name';
    cellhead3.classList.add('heading');
    trowhead.append(cellhead3);
    const cellhead4 = document.createElement('div');
    cellhead4.textContent = 'Per box';
    cellhead4.classList.add('heading');
    trowhead.append(cellhead4);
    const cellhead5 = document.createElement('div');
    cellhead5.textContent = 'Volume';
    cellhead5.classList.add('heading');
    trowhead.append(cellhead5);
    // thead.append(trowhead);
    row.push(trowhead);

    // const tbody = document.createElement('div');

    results.forEach((result) => {
      const trow = document.createElement('div');
      const cell1 = document.createElement('div');
      cell1.classList.add('data');
      if (result.itemnr) {
        cell1.textContent = result.itemnr;
        trow.append(cell1);
      }
      const cell2 = document.createElement('div');
      cell2.classList.add('data');
      if (result.code) {
        cell2.textContent = result.code;
        trow.append(cell2);
      }
      const cell3 = document.createElement('div');
      cell3.classList.add('data');
      if (result.productname) {
        cell3.textContent = result.productname;
        trow.append(cell3);
      }
      const cell4 = document.createElement('div');
      cell4.classList.add('data');
      if (result.perbox) {
        cell4.textContent = result.perbox;
        trow.append(cell4);
      }
      const cell5 = document.createElement('div');
      cell5.classList.add('data');
      if (result.volume) {
        cell5.textContent = result.volume;
        trow.append(cell5);
      }
      // tbody.append(trow);
      row.push(trow);
    });
    // row.push(tbody);
    blockContents.push(row);
    return blockContents;
  },
};

// Checking 4th used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system/octobase_system_mixing_colours
const tillTitle = (data, vocCompliant, type, title, locale) => {
  const endResult = [];
  let obj = {};

  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant && entry.type.toLowerCase().replace(/ /g, '_') === type && entry.title.toLowerCase().replace(/ /g, '_') === title) {
      obj = new Obj(entry.type, entry['type-image'], entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}/${entry.title.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['title-desc'], 'stage4-table', entry.title, entry['title-image'], entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume, entry.code, entry['product-name']);
      endResult.push(obj);
    }
  });
  return endResult;
};

// Checking 2nd used case - https://www.octoral.com/en/products/non-voc/cleaning_agents
const tillType = (data, vocCompliant, type, locale) => {
  const endResult = [];
  const duplicates = [];
  let obj = {};

  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant && entry.type.toLowerCase().replace(/ /g, '_') === type) {
      if (!entry.title) {
        obj = new Obj(entry.type, entry['type-image'], entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'stage2-table', entry.title, entry['title-image'], entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume);
        endResult.push(obj);
      } else if (!duplicates.includes(entry.type)) { // Checking 3rd used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system
        duplicates.push(entry.type);
        obj = new Obj(entry.type, entry['type-image'], entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}/${entry.title.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'stage3-card', entry.title, entry['title-image'], entry['title-label']);
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

// Checking 1st used case - https://www.octoral.com/en/products/non-voc/
const tillVocCompliant = (data, vocCompliant, locale) => {
  const endResult = [];
  const duplicates = [];
  let obj = {};
  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant) {
      if (!duplicates.includes(entry.type)) {
        duplicates.push(entry.type);
        obj = new Obj(entry.type, entry['type-image'], entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['voc-compliant-label'], entry['voc-compliant-desc'], 'stage1-card');
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

let endResult = [];

async function fetchProducts(vocCompliant, type, title, locale = 'en') {
  console.log(vocCompliant, type, title, locale);
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'products';

  await window.placeholders;
  const json = window.placeholders[`${TRANSLATION_KEY}`][`${locale}`];

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

// Grouping by subtitle
const groupBy = (array, key) => array.reduce((accum, current) => {
  if (!accum[current[key]]) {
    accum[current[key]] = [];
  }
  accum[current[key]].push(current);
  return accum;
}, {});

export default async function decorate(doc) {
  // extends default template
  await loadTemplate(doc, 'default');
  const $section = doc.querySelector('section');
  let $products = div();

  // get path segments for use in product display logic
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  console.log(locale, products, vocCompliant, type, title);
  const result = await fetchProducts(vocCompliant, type, title, locale);
  console.log(result);

  // Displaying 1st used case
  const usedCase = result[0].feedType;
  if (usedCase === 'stage1-card') {
    $products = div(

      h1(`${result[0].label}`),
      p(`${result[0].desc}`),
    );
    const blockType = 'cards';
    const blockContents = resultParsers[blockType](result, 'type');
    const builtBlock = buildBlock(blockType, blockContents);
    const parentDiv = div(
      builtBlock,
    );
    $section.append($products);
    $section.append(parentDiv);
    decorateBlock(builtBlock);
    console.log(builtBlock);
    // await loadBlock(builtBlock);
    builtBlock.classList.add('products');
  }

  // Displaying 2nd used case
  if (usedCase === 'stage2-table') {
    $products = div(
      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    );
    $section.append($products);
  }

  // Displaying 3rd used case
  if (usedCase === 'stage3-card') {
    $products = div(

      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    );
    const blockType = 'cards';
    const blockContents = resultParsers[blockType](result, 'title');
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

  // Displaying 4th used case
  if (usedCase === 'stage4-table') {
    $products = div(

      h1(`${result[0].titlelabel}`),
      p(`${result[0].desc}`),
    );
    const blockType = 'productstable';
    $section.append($products);
    Object.keys((groupBy(result, 'subtitle'))).forEach(async (key) => {
      console.log(key);
      const blockContents = resultParsers[blockType](groupBy(result, 'subtitle')[key]);
      const builtBlock = buildBlock(blockType, blockContents);
      const parentDiv = div(
        builtBlock,
      );
      $section.append(parentDiv);
      decorateBlock(builtBlock);
      await loadBlock(builtBlock);
    });
  }
}
