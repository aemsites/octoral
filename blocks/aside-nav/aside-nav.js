import { ul, li, a } from '../../scripts/dom-helpers.js';
import { getPathSegments, loadTranslations, translate, normalizeString } from '../../scripts/utils.js';

export default async function decorate(block) {
  block.innerHTML = '';
  const [locale] = getPathSegments();

  // Load translations by locale and store for later use
  await loadTranslations('/products-test.json?sheet=translations', locale);

  // Function to process JSON data and generate nested list HTML
  function buildNav(data) {
    const organizedData = {};

    data.forEach((item) => {
      const levels = [item.voc, item.type, item['sub-type']].filter(Boolean); // filter out any empty values
      let currentLevel = organizedData;

      levels.forEach((level) => {
        if (!currentLevel[level]) {
          currentLevel[level] = { title: level, children: {} };
        }
        currentLevel = currentLevel[level].children;
      });
    });

    // create UL list from the hierarchical structure
    function createList(items, basePath = '') {
      const $ul = ul({ class: 'aside-nav' });

      Object.values(items).forEach((item) => {
        // Construct the href path
        const pathSegments = [locale, 'products', basePath, normalizeString(item.title)].filter(Boolean);
        const href = `/${pathSegments.join('/')}`;

        // Create the list item
        const $li = li(a({ href }, translate(item.title)));

        // Recursively add children li elements
        if (Object.keys(item.children).length > 0) {
          // adjust base path
          const newBasePath = [basePath, normalizeString(item.title)].filter(Boolean).join('/');
          $li.appendChild(createList(item.children, newBasePath));
        }

        $ul.appendChild($li);
      });

      return $ul;
    }

    // create list
    return createList(organizedData);
  }

  // Fetch JSON and build the nested list
  try {
    const response = await fetch('/drafts/dfink/products.json?sheet=products');
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    const $asideNav = buildNav(data.data);
    block.append($asideNav);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
