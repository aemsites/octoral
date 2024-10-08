import { div, summary, details } from '../../scripts/dom-helpers.js';
import { getPathSegments } from '../../scripts/utils.js';

export async function fetchPlaceholders(locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'translations';
  const TRANSLATION_KEY_PRODUCTS = 'products';
  const loaded = window.placeholders[`${TRANSLATION_KEY}-loaded`];

  if (!loaded) {
    window.placeholders[`${TRANSLATION_KEY}-loaded`] = new Promise((resolve, reject) => {
      fetch(`/products.json?sheet=translations&sheet=${locale}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          throw new Error(`${resp.status}: ${resp.statusText}`);
        })
        .then((json) => {
          const placeholders = {};
          const KEY = 'Key';
          json.translations.data.forEach((entry) => {
            Object.keys(entry).forEach((localeKey) => {
              if (localeKey !== KEY) {
                if (placeholders[localeKey]) {
                  placeholders[localeKey][entry.Key.toLowerCase()] = entry[localeKey];
                } else {
                  placeholders[localeKey] = {
                    [entry.Key.toLowerCase()]: entry[localeKey],
                  };
                }
              }
            });
          });
          window.placeholders[TRANSLATION_KEY] = placeholders;
          window.placeholders[TRANSLATION_KEY_PRODUCTS] = json;
          resolve();
        }).catch((error) => {
        // Error While Loading Placeholders
          window.placeholders[TRANSLATION_KEY] = {};
          reject(error);
        });
    });
  }
  await window.placeholders[`${TRANSLATION_KEY}-loaded`];
  return [window.placeholders[TRANSLATION_KEY][locale], window.placeholders[TRANSLATION_KEY][`${locale}-href`]];
}

let currentPath;
function expand(element) {
  if (element.getAttribute('href').length === 0) {
    return;
  }
  const urlPathname = new URL(element.href).pathname;

  if (urlPathname === currentPath) {
    if (element.closest('details')) {
      element.closest('details').open = true;
      if (element.closest('details').parentNode && element.closest('details').parentNode.closest('details')) {
        element.closest('details').parentNode.closest('details').open = true;
        element.classList.add('blue');
      } else {
        element.parentNode.classList.add('dark-grey');
      }
    }
  }
}

function replaceEntries(placeholders, element) {
  const text = element.innerText.toLowerCase();
  Object.keys(placeholders[0]).forEach((key) => {
    if (text === key) {
      element.innerText = placeholders[0][key];
      element.setAttribute('href', placeholders[1][key]);
      expand(element);
    }
  });
}

export default async function decorate(block) {
  let [locale] = getPathSegments();
  const regions = ['en', 'de', 'es', 'fr', 'it', 'nl', 'us'];
  if (!regions.some((region) => region === locale)) {
    locale = 'en';
  }
  currentPath = window.location.pathname;
  const placeholders = await fetchPlaceholders(locale);
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const parentSummary = summary({ class: 'accordion-item-label' });
    parentSummary.append(...label.childNodes);
    // decorate accordion item body
    const check = !!row.children[1];
    const body = row.children[1];
    if (body) {
      body.className = 'accordion-item-body';
      body.querySelectorAll('p').forEach((p) => {
        if (p.nextElementSibling && p.nextElementSibling.tagName === 'UL') {
          const childDetails = details({ class: 'child-accordion-item' });
          const childSummary = summary({ class: 'child-accordion-item-label' });
          childSummary.innerHTML = `<p>${p.innerHTML}</p>`;
          const childBody = div({ class: 'child-accordion-item-body' });
          p.nextElementSibling.querySelectorAll('li').forEach((li) => {
            childBody.innerHTML += `<p>${li.innerHTML}</p>`;
          });
          childDetails.append(childSummary, childBody);
          p.nextElementSibling.remove();
          p.replaceWith(childDetails);
        }
      });
    }
    // decorate accordion item
    const parentDetails = details({ class: 'accordion-item' });
    if (check) {
      parentDetails.append(parentSummary, body);
    } else {
      parentSummary.classList.add('accordion-item-no-body');
      parentDetails.append(parentSummary);
    }
    parentDetails.querySelectorAll('a').forEach((a) => {
      if (a.classList.contains('button')) {
        a.classList.remove('button');
        replaceEntries(placeholders, a);
        if (a.getAttribute('href').length === 0) {
          a.remove();
        }
      } else {
        replaceEntries(placeholders, a);
        if (a.getAttribute('href').length === 0) {
          a.remove();
        }
      }
    });
    parentDetails.querySelectorAll('p').forEach((p) => {
      if (p.classList.contains('button-container')) {
        p.classList.remove('button-container');
      }
      if (p.children.length === 0 && p.innerText.trim().length === 0) {
        p.remove();
      }
    });
    if (parentDetails.querySelector('div') && !parentDetails.querySelector('div').querySelector('a')) {
      parentDetails.querySelector('.accordion-item-label').classList.add('accordion-item-no-body');
    }
    parentDetails.querySelectorAll('.child-accordion-item summary').forEach((sum) => {
      if (sum.parentElement.querySelectorAll('.child-accordion-item-body a').length === 0) {
        sum.classList.add('accordion-item-no-body');
        sum.parentElement.querySelector('.child-accordion-item-body').classList.add('child-accordion-item-no-body');
      }
    });
    row.replaceWith(parentDetails);
  });

  // perform cleanup for navigation items that are not available in current locale
  block.querySelectorAll('div.child-accordion-item-body:empty').forEach((elem) => elem.remove());
  block.querySelectorAll('summary:empty').forEach((elem) => elem.remove());
  block.querySelectorAll('details:empty').forEach((elem) => elem.remove());
}
