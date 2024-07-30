export function getPathSegments() {
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment);
  // Return the full array of segments
  return pathSegments;
}

export async function fetchPlaceholders(locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'translation';
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
          console.log(json.data);

          json.data.forEach((entry) => {
            Object.keys(entry).forEach((localeKey) => {
              if (localeKey !== KEY) {
                if (placeholders[localeKey]) {
                  placeholders[localeKey][entry.Key.toLowerCase()] = entry[localeKey];
                } else {
                  placeholders[localeKey] = {
                    [entry.Key.toLowerCase()]: entry[localeKey],
                  };
                }
              }
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
  const placeholders = await fetchPlaceholders(locale);
  console.log(placeholders);
}
