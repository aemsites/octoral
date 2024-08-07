import {
  a, p,
} from '../../scripts/dom-helpers.js';
import { getPathSegments } from '../../scripts/utils.js';
import { loadTemplate } from '../../scripts/scripts.js';

const newsNavInfo = [
  { code: 'en', label: 'News', link: '/en/news' },
  { code: 'nl', label: 'NIEUWS', link: '/nl/nieuws' },
  { code: 'de', label: 'NACHRICHTEN', link: '/de/nachrichten' },
  { code: 'fr', label: 'NOUVELLES', link: '/fr/nouvelles' },
  { code: 'it', label: 'NOVITÀ', link: '/it/novita' },
  { code: 'es', label: 'NOTICIA', link: '/es/noticia' },
];

export default async function decorate(doc) {
  const [locale] = getPathSegments();
  let label; let
    link;
  try {
    ({ label, link } = newsNavInfo.find((newsNav) => newsNav.code === locale));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Unsupported locale found for news article');
  }

  const newsLink = p({ class: 'news-collection' });
  const newsRef = a({ href: link }, label);
  newsLink.appendChild(newsRef);

  const mainDiv = doc.querySelector('div:first-of-type div');
  mainDiv.insertBefore(newsLink, mainDiv.firstChild);

  await loadTemplate(doc, 'default');
}
