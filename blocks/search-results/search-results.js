import ffetch from '../../scripts/ffetch.js';
import { getPathSegments, normalizeString } from '../../scripts/utils.js';
import {
  div, a,
} from '../../scripts/dom-helpers.js';
import {
  buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';

class SearchObj {
  constructor(searchTitle, searchDescription, searchPath, searchPublished) {
    this.searchTitle = searchTitle;
    this.searchDescription = searchDescription;
    this.searchPath = searchPath;
    this.searchPublished = searchPublished;
  }
}

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: (results) => {
    const blockContents = [];
    results.forEach((result) => {
      const row = [];
      const cardBody = div();
      const divTitle = div();
      divTitle.textContent = result.searchTitle.toUpperCase();
      const pathv1 = a({ class: 'title' });
      pathv1.href = window.location.origin + result.searchPath;
      pathv1.append(divTitle);
      cardBody.appendChild(pathv1);
      const divPublishedDate = div({ class: 'publisheddate' });
      if (result.searchPublished.length > 0) {
        divPublishedDate.textContent = new Date(result.searchPublished * 1000).toDateString();
      }
      const divDescription = div({ class: 'description' });
      divDescription.textContent = result.searchDescription;
      const divPath = div();
      divPath.textContent = result.searchPath;
      const pathv2 = a({ class: 'path' });
      pathv2.href = pathv1.href;
      pathv2.append(divPath);
      cardBody.appendChild(divPublishedDate);
      cardBody.appendChild(divDescription);
      cardBody.appendChild(pathv2);
      row.push(cardBody);

      blockContents.push(row);
    });
    return blockContents;
  },
};

function searchItems(searchTerm) {
  const tokenizedSearchWords = searchTerm.split(' ');
  if (tokenizedSearchWords.length > 1) tokenizedSearchWords.unshift(searchTerm);
  return tokenizedSearchWords;
}

function filterMatches(tokenizedSearchWords, jsonData) {
  const allMatches = [];
  tokenizedSearchWords.forEach((searchTerm) => {
    const matches = jsonData.filter((entry) => (
      entry.path
        + entry.title
        + entry.description
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase()));
    allMatches.push(...matches);
  });
  // remove duplicates:
  return [...new Set(allMatches)];
}

function filterProductMatches(tokenizedSearchWords, jsonData) {
  const allMatches = [];
  tokenizedSearchWords.forEach((searchTerm) => {
    const matches = jsonData.filter((entry) => (
      entry['voc-compliant']
        + entry['voc-compliant-label']
        + entry['voc-compliant-desc']
        + entry.type
        + entry['type-label']
        + entry['type-desc']
        + entry.title
        + entry['title-label']
        + entry['title-desc']
        + entry['sub-title']
        + entry['item-nr']
        + entry.code
        + entry['product-name']
        + entry.volume
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase()));
    allMatches.push(...matches);
  });
  // remove duplicates:
  return [...new Set(allMatches)];
}

async function loadResults(tokenizedSearchWords, resultsDiv) {
  const searchResults = [];
  const searchResultsProducts = [];
  let path = '';
  console.log(resultsDiv);
  const [rawLocale, , , ,] = getPathSegments();
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'translations';
  const newsTranslation = window.placeholders[`${TRANSLATION_KEY}`][`${rawLocale}`].news;

  await window.placeholders;

  const jsonDataNews = await ffetch(`/${rawLocale}/${newsTranslation}/query-index.json`)
    .chunks(1000)
    .all();
  const jsonDataOthers = await ffetch('/query-index.json')
    .chunks(1000)
    .all();

  const matchesNews = filterMatches(tokenizedSearchWords, jsonDataNews);
  const matchesOthers = filterMatches(tokenizedSearchWords, jsonDataOthers);
  [...matchesNews, ...matchesOthers].forEach((entry) => {
    const obj = new SearchObj(entry.title, entry.description, entry.path, entry.publishDate);
    searchResults.push(obj);
  });
  searchResults.sort((x, y) => y.searchPublished - x.searchPublished);
  console.log(searchResults);

  // Logic to search from Products
  const json = window.placeholders.products[`${rawLocale}`];
  const jsonDataProducts = json.data;
  const matchesProducts = filterProductMatches(tokenizedSearchWords, jsonDataProducts);
  matchesProducts.forEach((entry) => {
    // Get description of the search Products
    let description = entry['title-desc'] || entry['type-desc'] || entry['voc-compliant-desc'] || '';
    if (description.length === 0) {
      description = `${entry['voc-compliant'].toUpperCase()} .. ${entry.type} .. ${entry.title} .. ${entry['sub-title']} .. ${entry['item-nr']} .. ${entry['product-name']}`;
    }
    // Get title of the search Products
    const title = entry['product-name'] || entry['sub-title'] || entry.title || entry.type || entry['voc-compliant'] || '';
    // Get path of the search Products
    if (entry.type.length === 0 && entry.title.length === 0) {
      path = `/${rawLocale}/products/${entry['voc-compliant']}`;
    } else if (entry.type.length > 0 && entry.title.length === 0) {
      path = `/${rawLocale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}`;
    } else if (title.length > 0) {
      path = `/${rawLocale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}/${normalizeString(entry.title)}`;
    }
    const obj = new SearchObj(title, description, path, '');
    searchResultsProducts.push(obj);
  });
  console.log(searchResultsProducts);

  const blockType = 'cards';
  const blockContents = resultParsers[blockType]([...searchResults, ...searchResultsProducts]);
  const builtBlock = buildBlock(blockType, blockContents);
  const parentDiv = div(
    builtBlock,
  );
  resultsDiv.append(parentDiv);
  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  builtBlock.classList.add('searchItems');
}

export default async function decorate(block) {
  block.innerHTML = '';
  const searchTerm = new URLSearchParams(window.location.search).get('query');
  if (searchTerm) {
    const tokenizedSearchWords = searchItems(searchTerm);
    loadResults(tokenizedSearchWords, block);
  }
}
