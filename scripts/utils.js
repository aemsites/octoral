/**
 * Retrieves the path segments of the current window's pathname.
 * The pathname is split into segments by '/' (ignoring empty segments),
 * and the segments are returned as an array.
 * @returns {string[]} An array of path segments.
 */
export function getPathSegments() {
  return window.location.pathname.split('/')
    .filter((segment) => segment);
}

export function normalizeString(str) {
  return str.toLowerCase().replace(/ /g, '_');
}

// Function to fetch translations and return a lookup object
let translations = {};
export async function loadTranslations(url, locale) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch translations');
    const data = await response.json();

    // Create a lookup object for translations
    translations = data.data.reduce((acc, item) => {
      acc[item.key] = item[locale] || item.en;
      return acc;
    }, {});
    return translations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading translations:', error);
    return {};
  }
}

// Function to get translated text based on key
export function translate(key) {
  return translations[key] || key;
}

// Links opening in new tab
export function externalLinks(main) {
  const links = main.querySelectorAll('a[href]');
  links.forEach((linkItem) => {
    const hrefURL = new URL(linkItem.href);
    if (hrefURL.pathname.includes('pdf') || hrefURL.hostname !== window.location.hostname) {
      linkItem.setAttribute('target', '_blank');
    }
  });
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
export function addPagingWidget(
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
