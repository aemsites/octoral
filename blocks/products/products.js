export class ObjJustVocCompliant {
  constructor(type, image, href) {
    this.type = type;
    this.image = image;
    this.href = href;
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
        obj = new ObjJustVocCompliant(entry.type, entry.image, `/${locale}/products/${entry['voc-compliant']}/${entry.type.toLowerCase().replace(/ /g, '_')}`);
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

export async function fetchPlaceholders(vocCompliant, type, title, locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'products';
  const loaded = window.placeholders[`${TRANSLATION_KEY}-loaded`];

  if (!loaded) {
    window.placeholders[`${TRANSLATION_KEY}-loaded`] = new Promise((resolve, reject) => {
      fetch(`/products.json?helix-${locale}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          throw new Error(`${resp.status}: ${resp.statusText}`);
        })
        .then((json) => {
          const placeholders = {};
          const KEY = 'Key';

          if (typeof type === 'undefined' && typeof title === 'undefined') {
            const endResult = justvocCompliant(json.data, vocCompliant, locale);
            console.log(endResult);
          }

          json.data.forEach((entry) => {
            Object.keys(entry).forEach((localeKey) => {



            //   if (localeKey !== KEY) {
            //     if (placeholders[localeKey]) {
            //       placeholders[localeKey][entry.Key.toLowerCase()] = entry[localeKey];
            //     } else {
            //       placeholders[localeKey] = {
            //         [entry.Key.toLowerCase()]: entry[localeKey],
            //       };
            //     }
            //   }
            });
          });

          window.placeholders[TRANSLATION_KEY] = placeholders;
          resolve();
        }).catch((error) => {
          // Error While Loading Placeholders
          window.placeholders[TRANSLATION_KEY] = {};
          reject(error);
        });
    });
  }
  await window.placeholders[`${TRANSLATION_KEY}-loaded`];
  return [window.placeholders[TRANSLATION_KEY][locale], window.placeholders[TRANSLATION_KEY][`${locale}-href`]];
}

export default async function decorate(block) {
  const [locale, products, vocCompliant, type, title] = getPathSegments();
  console.log(locale, products, vocCompliant, type, title);
  const placeholders = await fetchPlaceholders(vocCompliant, type, title, locale);
}
