export class ObjJustVocCompliant {
  constructor(type, image, href, label, desc) {
    this.type = type;
    this.image = image;
    this.href = href;
    this.label = label;
    this.desc = desc;
  }
}

export function getPathSegments() {
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment);
  // Return the full array of segments
  return pathSegments;
}

const justvocCompliant = (data, vocCompliant, locale) => {
  const endResult = [];
  const duplicates = [];
  let obj = {};
  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant) {
      if (!duplicates.includes(entry.type)) {
        duplicates.push(entry.type);
        obj = new ObjJustVocCompliant(entry.type, entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`, entry['voc-compliant-label'], entry['voc-compliant-desc']);
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

let endResult = [];

export async function fetchProducts(vocCompliant, type, title, locale = 'en') {
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
            endResult = justvocCompliant(json.data, vocCompliant, locale);
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

export default async function decorate(block) {
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  console.log(locale, products, vocCompliant, type, title);
  const result = await fetchProducts(vocCompliant, type, title, locale);
  console.log(result);
}
