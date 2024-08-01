// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import { div, p, h1, h2 } from '../../scripts/dom-helpers.js';
import { getPathSegments, loadTranslations, translate, normalizeString } from '../../scripts/utils.js';

export default async function decorate(doc) {
  // Extend default template
  await loadTemplate(doc, 'default');

  // Get path segments for use in product display logic
  const [locale, productPath, vocCompliant, type, subType] = getPathSegments();

  // Load translations by locale and store for later use
  await loadTranslations('/products-test.json?sheet=translations', locale);

  // console.log('locale:', locale);
  // console.log('products:', productPath);
  // console.log('voc:', vocCompliant);
  // console.log('type:', type);
  // console.log('sub-type:', subType);
  // console.log('-------------------');

  async function fetchData() {
    try {
      const response = await fetch('/products-test.json?sheet=products');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    }
  }

  function displayProducts(products) {
    const $section = doc.querySelector('section');
    $section.innerHTML = '';

    console.log('products:', products); // Debugging output
    const isLandingPage = vocCompliant && !type && !subType;
    const isTypePage = vocCompliant && type && !subType;
    const isSubTypePage = vocCompliant && type && subType;

    // create productPage document fragment

    let heading;
    if (isLandingPage) heading = products[0].voc;
    if (isTypePage || isSubTypePage) heading = products[0].type;

    $section.append(h1(translate('voc')));

    const $products = div();

    if (isLandingPage) {
      const uniqueProductTypes = new Set();
      products.forEach((product) => {
        const productType = translate(product.type); // Translate the product type

        // Only append if the type hasn't been seen before
        if (!uniqueProductTypes.has(productType)) {
          uniqueProductTypes.add(productType); // Add the type to the Set
          $products.append(h2(productType)); // Append the unique type to the DOM
        }
      });
    }

    // console.log('productPage:', $products); // Debugging output
    $section.append($products);
  }

  async function getProductInfo() {
    const products = await fetchData();

    // Define search criteria with normalization
    const searchCriteria = {
      voc: vocCompliant || null,
      type: type || null,
      'sub-type': subType || null,
    };

    console.log('Search criteria:', searchCriteria); // Debugging output

    // Find all products that match the search criteria
    const matchingProducts = products.filter((item) => {
      const itemVoc = normalizeString(item.voc);
      const itemType = normalizeString(item.type);
      const itemSubType = normalizeString(item['sub-type']);

      // Check if criteria should be considered
      return (!searchCriteria.voc || itemVoc === searchCriteria.voc)
        && (!searchCriteria.type || itemType === searchCriteria.type)
        && (!searchCriteria['sub-type'] || itemSubType === searchCriteria['sub-type']);
    });

    if (matchingProducts.length > 0) {
      displayProducts(matchingProducts);
    } else {
      console.log('No products found');
    }
  }


  getProductInfo();
}
