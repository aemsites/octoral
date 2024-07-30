import { div, summary, details } from '../../scripts/dom-helpers.js';

export async function fetchPlaceholders(locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'translation';
  const loaded = window.placeholders[`${TRANSLATION_KEY}-loaded`];

  if (!loaded) {
    window.placeholders[`${TRANSLATION_KEY}-loaded`] = new Promise((resolve, reject) => {
      fetch('/translations.json')
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          throw new Error(`${resp.status}: ${resp.statusText}`);
        })
        .then((json) => {
          const placeholders = {};
          const KEY = 'Key';

          json.data.forEach((entry) => {
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

function expand(element, param) {
  const urlPathname = new URL(element.href).pathname;
  if (urlPathname === param) {
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

function replaceEntries(placeholders, element, param) {
  const text = element.innerText.toLowerCase();
  Object.keys(placeholders[0]).forEach((key) => {
    if (text === key) {
      element.innerText = placeholders[0][key];
      element.setAttribute('href', placeholders[1][key]);
      expand(element, param);
    }
  });
}

let locale = 'en';

export default async function decorate(block) {
  const param = new URL(window.location).pathname;
  if (param.includes('/products/')) {
    // eslint-disable-next-line prefer-destructuring
    locale = /[a-z]*\/products\//.exec(param)[0].split('/')[0];
    if (locale === '') {
      locale = 'en';
    }
  }

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
        replaceEntries(placeholders, a, param);
      } else {
        replaceEntries(placeholders, a, param);
      }
    });
    parentDetails.querySelectorAll('p').forEach((p) => {
      if (p.classList.contains('button-container')) {
        p.classList.remove('button-container');
      }
    });
    row.replaceWith(parentDetails);
  });
}
