import ffetch from '../../scripts/ffetch.js';
import { getPathSegments, normalizeString, addPagingWidget } from '../../scripts/utils.js';
import {
  div, a, li,
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

export function getSearchParams(searchParams) {
  let curPage = new URLSearchParams(searchParams).get('pg');
  if (!curPage) {
    curPage = 0;
  } else {
    // convert the current page to a number
    curPage = parseInt(curPage, 10);
  }

  const searchTerm = new URLSearchParams(searchParams).get('query');
  return { searchTerm, curPage };
}

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

async function loadResults(tokenizedSearchWords, resultsDiv, page) {
  const searchResults = [];
  const searchResultsProducts = [];
  let path = '';
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

  const blockType = 'cards';
  const resultsPerPage = 10;
  const startResult = page * resultsPerPage;

  // eslint-disable-next-line max-len
  const curPage = [...searchResults, ...searchResultsProducts].slice(startResult, startResult + resultsPerPage);

  const blockContents = resultParsers[blockType](curPage);
  const builtBlock = buildBlock(blockType, blockContents);

  const parentDiv = div(
    builtBlock,
  );

  // Pagination logic
  const totalResults = [...searchResults, ...searchResultsProducts].length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  addPagingWidget(parentDiv, page, totalPages);
  const paginationblock = parentDiv.querySelector('ul');
  const paginationLimit = 5;
  if (totalPages > paginationLimit) {
    let elementForward = 0;
    const threeDotsAfter = li();
    const ata = a();
    ata.innerText = '...';
    threeDotsAfter.appendChild(ata);

    const threeDotsBefore = li();
    const atb = a();
    atb.innerText = '...';
    threeDotsBefore.appendChild(atb);

    const firstElement = paginationblock.querySelector('.prev.page').nextElementSibling;
    const lastElement = paginationblock.querySelector('.next.page').previousElementSibling;
    firstElement.after(threeDotsBefore);
    lastElement.before(threeDotsAfter);

    if (page < (paginationLimit - 1)) {
      firstElement.nextElementSibling.classList.add('notvisible');
      const currentElement = paginationblock.querySelector('.active');
      // eslint-disable-next-line max-len
      elementForward = (page === 0) ? currentElement.nextElementSibling.nextElementSibling.nextElementSibling : currentElement.nextElementSibling.nextElementSibling;
      while (elementForward) {
        elementForward.classList.add('notvisible');
        elementForward = elementForward.nextElementSibling;
        if (elementForward.innerText === '...') break;
      }
    }
    if (page > (paginationLimit - 2) && (page < (totalPages - 3))) {
      const currentElement = paginationblock.querySelector('.active');
      elementForward = currentElement.nextElementSibling.nextElementSibling;
      while (elementForward) {
        elementForward.classList.add('notvisible');
        elementForward = elementForward.nextElementSibling;
        if (elementForward.innerText === '...') break;
      }
      // eslint-disable-next-line max-len
      let elementBefore = currentElement.previousElementSibling.previousElementSibling.previousElementSibling;
      while (elementBefore) {
        elementBefore.classList.add('notvisible');
        elementBefore = elementBefore.previousElementSibling;
        if (elementBefore.innerText === '...') break;
      }
    } else if (page > (totalPages - 4)) {
      const currentElement = paginationblock.querySelector('.active');
      lastElement.previousElementSibling.classList.add('notvisible');
      // eslint-disable-next-line max-len
      let elementBefore = currentElement.previousElementSibling.previousElementSibling.previousElementSibling;
      while (elementBefore) {
        elementBefore.classList.add('notvisible');
        elementBefore = elementBefore.previousElementSibling;
        if (elementBefore.innerText === '...') break;
      }
    }
  }

  resultsDiv.append(parentDiv);
  decorateBlock(builtBlock);
  await loadBlock(builtBlock);
  builtBlock.classList.add('searchItems');
}

export default async function decorate(block) {
  block.innerHTML = '';
  const curLocation = window.location;
  const { searchTerm, curPage } = getSearchParams(curLocation.search);
  if (searchTerm) {
    const tokenizedSearchWords = searchItems(searchTerm);
    loadResults(tokenizedSearchWords, block, curPage);
  }
}
