import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  getMetadata,
} from './aem.js';

import { externalLinks } from './utils.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/** allow for link attributes to be added by authors
 * example usage = Text [class:button,target:_blank,title:Title goes here]
 * @param main
 */
export function decorateLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    // match text inside [] and split by '|'
    const match = a.textContent.match(/(.*)\[([^\]]*)]/);
    if (match) {
      // eslint-disable-next-line no-unused-vars
      const [_, linkText, attrs] = match;
      a.textContent = linkText.trim();
      attrs.split(',').forEach((attr) => {
        let [key, ...value] = attr.trim().split(':');
        key = key.trim().toLowerCase();
        value = value.join().trim();
        if (key) a.setAttribute(key, value);
      });
    }
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateLinks(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  externalLinks(main);
}

/**
 * Decorates the template.
 */
export async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(
        `${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`,
      )
        .then(resolve)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `failed to load css module for ${templateName}`,
            err.target.href,
          );
          resolve();
        });
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(
            `../templates/${templateName}/${templateName}.js`
          );
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });

    document.body.classList.add(`${templateName}-template`);

    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

/**
 * Add a paging widget to the div. The paging widget looks like this:
 * <pre><code>
 * &lt; 1 2 3 &gt;
 * </code></pre>
 * The numbers are hyperlinks to the repective pages and the &lt; and &gt;
 * buttons are links to next and previous pages. If this is the first page
 * then the &lt; link has the style 'disabled' and if this is the lase one
 * the &gt; link is disabled.
 * @param {HTMLElement} div - The div to add the widget to
 * @param {number} curpage - The current page number (starting at 0)
 * @param {number} totalPages - The total number of pages
 * @param {Document} doc - The current Document
 * @param {Location} curLocation - THe current window.location to use
 */
export default function addPagingWidget(
  div,
  curpage,
  totalPages,
  doc = document,
  curLocation = window.location,
) {
  const queryParams = new URLSearchParams(curLocation.search);
  const nav = doc.createElement('ul');
  nav.classList.add('pagination');

  if (totalPages > 1) {
    const lt = doc.createElement('li');
    lt.classList.add('page');
    lt.classList.add('prev');
    const lta = doc.createElement('a');
    if (curpage === 0) {
      lt.classList.add('disabled');
    } else {
      queryParams.set('pg', curpage - 1);
      lta.href = `${curLocation.pathname}?${queryParams}`;
    }
    lt.appendChild(lta);
    nav.appendChild(lt);

    for (let i = 0; i < totalPages; i += 1) {
      const numli = doc.createElement('li');
      if (i === curpage) {
        numli.classList.add('active');
      }

      const a = doc.createElement('a');
      a.innerText = i + 1;

      queryParams.set('pg', i);
      a.href = `${curLocation.pathname}?${queryParams}`;
      numli.appendChild(a);

      nav.appendChild(numli);
    }

    const rt = doc.createElement('li');
    rt.classList.add('page');
    rt.classList.add('next');
    const rta = doc.createElement('a');
    if (curpage === totalPages - 1) {
      rt.classList.add('disabled');
    } else {
      queryParams.set('pg', curpage + 1);
      rta.href = `${curLocation.pathname}?${queryParams}`;
    }

    rt.appendChild(rta);
    nav.appendChild(rt);
  }

  div.appendChild(nav);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  const templateName = getMetadata('template');
  decorateTemplateAndTheme(templateName);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    if (templateName) {
      await loadTemplate(doc, templateName);
    }
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
