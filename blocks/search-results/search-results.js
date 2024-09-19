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
  console.log(matchesNews);
  const matchesOthers = filterMatches(tokenizedSearchWords, jsonDataOthers);
  console.log(matchesOthers);
}

export default async function decorate(block) {
  block.innerHTML = '';
  const searchTerm = new URLSearchParams(window.location.search).get('query');
  if (searchTerm) {
    const tokenizedSearchWords = searchItems(searchTerm);
    loadResultsFromNews(tokenizedSearchWords, block);
  }
}
