import ffetch from '../../scripts/ffetch.js';
import { getPathSegments } from '../../scripts/utils.js';

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

async function loadResultsFromNews(tokenizedSearchWords, resultsDiv) {
  const [rawLocale, , , ,] = getPathSegments();
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'translations';
  const newsTranslation = window.placeholders[`${TRANSLATION_KEY}`][`${rawLocale}`].news;

  await window.placeholders;
  const jsonData = await ffetch(`/${rawLocale}/${newsTranslation}/query-index.json`)
    .chunks(1000)
    .all();
  console.log(jsonData);
  console.log(tokenizedSearchWords);
  console.log(rawLocale);
  console.log(window.location.hostname);
  console.log(resultsDiv);

  const matches = filterMatches(tokenizedSearchWords, jsonData);
  console.log(matches);
}

export default async function decorate(block) {
  block.innerHTML = '';
  const searchTerm = new URLSearchParams(window.location.search).get('query');
  if (searchTerm) {
    const tokenizedSearchWords = searchItems(searchTerm);
    loadResultsFromNews(tokenizedSearchWords, block);
  }
}
