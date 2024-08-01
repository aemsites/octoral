// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import getPathSegments from '../../scripts/utils.js';
import { div, h1, p } from '../../scripts/dom-helpers.js';

class Obj {
  // eslint-disable-next-line max-len
  constructor(type, typelabel, image, href, label, desc, feedType, title, titlelabel, subtitle, itemnr, perbox, volume, code, productname) {
    this.type = type;
    this.typelabel = typelabel;
    this.image = image;
    this.href = href;
    this.label = label;
    this.desc = desc;
    this.feedType = feedType;
    this.title = title;
    this.titlelabel = titlelabel;
    this.subtitle = subtitle;
    this.itemnr = itemnr;
    this.perbox = perbox;
    this.volume = volume;
    this.code = code;
    this.productname = productname;
  }
}

// Checking 4th used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system/octobase_system_mixing_colours
const tillTitle = (data, vocCompliant, type, title, locale) => {
  const endResult = [];
  let obj = {};

  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant && entry.type.toLowerCase().replace(/ /g, '_') === type && entry.title.toLowerCase().replace(/ /g, '_') === title) {
      obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}/${entry.title.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['title-desc'], 'stage4-table', entry.title, entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume, entry.code, entry['product-name']);
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
        obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'stage2-table', entry.title, entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume);
        endResult.push(obj);
      } else if (!duplicates.includes(entry.type)) { // Checking 3rd used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system
        duplicates.push(entry.type);
        obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}/${entry.title.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'stage3-card', entry.title, entry['title-label']);
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
        obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['voc-compliant-label'], entry['voc-compliant-desc'], 'stage1-card');
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
  }

  // Displaying 2nd used case
  if (usedCase === 'stage2-table') {
    $products = div(
      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    );
  }

  // Displaying 3rd used case
  if (usedCase === 'stage3-card') {
    $products = div(

      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    );
  }

  // Displaying 4th used case
  if (usedCase === 'stage4-table') {
    $products = div(

      h1(`${result[0].titlelabel}`),
      p(`${result[0].desc}`),
    );
  }

  $section.append($products);
}
