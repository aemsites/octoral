import {
  a, h2, img, strong,
} from '../../scripts/dom-helpers.js';
import getPathSegments from '../../scripts/utils.js';
import { loadTemplate } from '../../scripts/scripts.js';

const newsNavInfo = [
  { code: 'en', label: 'News', link: '/en/news' },
  { code: 'nl', label: 'NIEUWS', link: '/nl/nieuws' },
  { code: 'de', label: 'NACHRICHTEN', link: '/de/nachrichten' },
  { code: 'fr', label: 'NOUVELLES', link: '/fr/nouvelles' },
  { code: 'it', label: 'NOVITÀ', link: '/it/novita' },
  { code: 'es', label: 'NOTICIA', link: '/es/noticia' },
];

function isTextContentUppercase(text) {
  return /^[A-Z,\-\s]+$/.test(text);
}

function fixHeadings(main) {
  const content = main.querySelectorAll('p strong');
  if (content) {
    content.forEach((el) => {
      if (isTextContentUppercase(el.textContent)) {
        el.classList.add('inline-heading');
      }
    });
  }
}

export default async function decorate(doc) {
  const [locale] = getPathSegments();
  let label; let
    link;
  try {
    ({ label, link } = newsNavInfo.find((newsNav) => newsNav.code === locale));
  } catch (e) {
    console.log('Unsupported locale found for news article');
  }

  const newsLink = h2({ class: 'news-collection' });
  const newsRef = a({ href: link });
  newsRef.textContent = label;
  newsLink.appendChild(newsRef);

  const mainDiv = doc.querySelector('div:first-of-type div');
  mainDiv.classList.add('news-template');
  mainDiv.insertBefore(newsLink, mainDiv.firstChild);

  // Handle Brochure Links
  const brochureEls = doc.querySelectorAll('.button-container');
  brochureEls.forEach((brochureEl) => {
    const brochureLinks = brochureEl.querySelectorAll('a');
    brochureLinks.forEach((brochureLink) => {
      brochureLink.classList.add('brochure-link');
      brochureLink.classList.remove('button');
      brochureLink.classList.remove('primary');
      if (brochureLink.textContent.search('class=download-button') !== -1) {
        const downloadImg = img({ src: '/assets/media_1c8b3df2b3dd1c604dfe7c9689fadf4db9447b739.jpeg', alt: 'Download' });
        brochureLink.removeAttribute('title');
        brochureLink.replaceChildren(downloadImg);
      }
    });
  });
  fixHeadings(mainDiv);

  // Boldify Tables Header
  const tables = doc.querySelectorAll('table');
  tables.forEach((table) => {
    const header = table.querySelector('tr');
    header.querySelectorAll('td').forEach((td) => {
      const elem = strong(td.textContent.trim());
      td.replaceChildren(elem);
    });
  });

  await loadTemplate(doc, 'default');
}
