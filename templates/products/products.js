// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import getPathSegments from '../../scripts/utils.js';

export default async function decorate(doc) {
  // extends default template
  await loadTemplate(doc, 'default');

  class Obj {
    // eslint-disable-next-line max-len
    constructor(type, typelabel, image, href, label, desc, feedType, title, titlelabel, subtitle, itemnr, perbox, volume) {
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
    }
  }

  // Checking 2nd used case - https://www.octoral.com/en/products/non-voc/cleaning_agents
  const tillType = (data, vocCompliant, type, locale) => {
    const endResult = [];
    const duplicates = [];
    let obj = {};

    data.forEach((entry) => {
      if (entry['voc-compliant'] === vocCompliant && entry.type.toLowerCase().replace(/ /g, '_') === type) {
        if (!entry.title) {
          obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'table', entry.title, entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume);
          endResult.push(obj);
        } else if (!duplicates.includes(entry.type)) { // Checking 3rd used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system
          duplicates.push(entry.type);
          obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}/${entry.title.toLowerCase().replace(/ /g, '_')}`, entry['type-label'], entry['type-desc'], 'card', entry.title, entry['title-label']);
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
          obj = new Obj(entry.type, entry['type-label'], entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['voc-compliant-label'], entry['type-desc'], 'card');
          endResult.push(obj);
        }
      }
    });
    return endResult;
  };

  let endResult = [];
  async function fetchProducts(vocCompliant, type, title, locale = 'en') {
    window.products = window.products || {};
    const TRANSLATION_KEY = 'products';
    const loaded = window.products[`${TRANSLATION_KEY}-loaded`];

    if (!loaded) {
      window.products[`${TRANSLATION_KEY}-loaded`] = new Promise((resolve, reject) => {
        fetch(`/products.json?helix-${locale}`)
          .then((resp) => {
            if (resp.ok) {
              return resp.json();
            }
            throw new Error(`${resp.status}: ${resp.statusText}`);
          })
          .then((json) => {
            const products = {};
            if (typeof type === 'undefined' && typeof title === 'undefined') {
              endResult = tillVocCompliant(json.data, vocCompliant, locale);
            }

            if (typeof type !== 'undefined' && typeof title === 'undefined') {
              endResult = tillType(json.data, vocCompliant, type, locale);
            }

            window.products[TRANSLATION_KEY] = products;
            resolve();
          }).catch((error) => {
            // Error While Loading Products
            window.products[TRANSLATION_KEY] = {};
            reject(error);
          });
      });
    }
    await window.products[`${TRANSLATION_KEY}-loaded`];
    return endResult;
  }

  // get path segments for use in product display logic
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  console.log(locale, products, vocCompliant, type, title);
  const result = await fetchProducts(vocCompliant, type, title, locale);
  console.log(result);
}
