import {
  div, h3, p, h1, a,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import ArticleList from '../../scripts/article-list.js';
import { loadTemplate } from '../../scripts/scripts.js';
import { getPathSegments } from '../../scripts/utils.js';

export default async function decorate(doc) {
  await loadTemplate(doc, 'default');
  const $page = doc.querySelector('main .section');
  const $articles = div({ class: 'articles' });
  const $pagination = div({ class: 'pagination' });
  const articlesPerPage = Number(getMetadata('articles-per-page')) || 10;
  const paginationMaxBtns = 4;

  const $articleCard = (article) =>
    // eslint-disable-next-line function-paren-newline, implicit-arrow-linebreak
    div({ class: 'card' },
      // eslint-disable-next-line function-paren-newline
      a({ href: article.path },
      // eslint-disable-next-line indent, function-paren-newline
      h3(article.title)),
      p(article.description),
    );

  const [locale, news] = getPathSegments();
  const newsTitle = [
    { code: 'en', title: 'News' },
    { code: 'nl', title: 'Nieuws' },
    { code: 'de', title: 'Nachrichten' },
    { code: 'fr', title: 'Nouvelles' },
    { code: 'it', title: 'Novità' },
    { code: 'es', title: 'Noticia' },
  ];
  const localNews = newsTitle.find((entry) => entry.code === locale).title;
  // eslint-disable-next-line object-curly-spacing
  const $newsPage = div(
    h1(`${localNews}`),
    $articles,
    $pagination,
  );

  $page.append($newsPage);

  await new ArticleList({
    jsonPath: `/${locale}/${news}/query-index.json`,
    articleContainer: $articles,
    articleCard: $articleCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
  }).render();
}
