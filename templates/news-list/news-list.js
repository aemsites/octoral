import {
  div, h3, p, aside, h1, a, section,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import ArticleList from '../../scripts/article-list.js';
import { loadFragment } from '../../blocks/fragment/fragment.js';

export default async function decorate(doc) {
  const $page = doc.querySelector('main .section');
  const $articles = div({ class: 'articles' });
  const $pagination = div({ class: 'pagination' });
  const articlesPerPage = Number(getMetadata('articles-per-page'));
  const paginationMaxBtns = Number(getMetadata('pagination-max-buttons'));
  // Old nav template
  // const lefNavFrag = await loadFragment('/drafts/Meet/en/products/leftdiv');
  const lefNavFrag = await loadFragment('/aside-nav');
  // Old nav instance
  // const $leftNav = lefNavFrag.querySelector('.accordion-wrapper').cloneNode(true);
  const $leftNav = lefNavFrag.querySelector('.aside-nav-wrapper').cloneNode(true);

  const $aside = aside(
    $leftNav,
  );

  const $articleCard = (article) => div(
    { class: 'card' },
    a(
      { href: article.path },
      h3(article.title),
    ),
    p(article.description),
  );

  const $newsPage = section(
    h1('News'),
    $articles,
    $pagination,
  );

  $page.append($aside, $newsPage);

  await new ArticleList({
    jsonPath: '/drafts/tmorris/new-dummy-data.json',
    articleContainer: $articles,
    articleCard: $articleCard,
    articlesPerPage,
    paginationContainer: $pagination,
    paginationMaxBtns,
  }).render();
}