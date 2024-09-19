import ffetch from '../../scripts/ffetch.js';
import { getPathSegments } from '../../scripts/utils.js';

function searchItems(searchTerm) {
  const tokenizedSearchWords = searchTerm.split(' ');
  if (tokenizedSearchWords.length > 1) tokenizedSearchWords.unshift(searchTerm);
  return tokenizedSearchWords;
}

async function loadResultsFromNews(tokenizedSearchWords, resultsDiv) {
  const [rawLocale, , , ,] = getPathSegments();
  const jsonData = await ffetch(`/${rawLocale}/news/query-index.json`)
    .chunks(1000)
    .all();
  console.log(jsonData);
  console.log(tokenizedSearchWords);
  console.log(rawLocale);
  console.log(window.location.hostname);
  console.log(resultsDiv);
}

export default async function decorate(block) {
  block.innerHTML = '';
  const searchTerm = new URLSearchParams(window.location.search).get('query');
  if (searchTerm) {
    const tokenizedSearchWords = searchItems(searchTerm);
    loadResultsFromNews(tokenizedSearchWords, block);
  }
}
