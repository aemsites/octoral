import { div } from '../../scripts/dom-helpers.js';

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
  return window.placeholders[TRANSLATION_KEY][locale];
}

export default async function decorate(block) {
  const locale = 'en-href';
  const placeholders = await fetchPlaceholders(locale);
  console.log(placeholders);
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const check = !!row.children[1];
    const body = row.children[1];
    if (body) {
      body.className = 'accordion-item-body';
      body.querySelectorAll('p').forEach((p) => {
        if (p.nextElementSibling && p.nextElementSibling.tagName === 'UL') {
          const childDetails = document.createElement('details');
          childDetails.className = 'child-accordion-item';
          const childSummary = document.createElement('summary');
          childSummary.className = 'child-accordion-item-label';
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
    const details = document.createElement('details');
    details.className = 'accordion-item';
    if (check) {
      details.append(summary, body);
    } else {
      summary.classList.add('accordion-item-no-body');
      details.append(summary);
    }
    details.querySelectorAll('a').forEach((a) => {
      if (a.classList.contains('button')) {
        a.classList.remove('button');
      }
    });
    details.querySelectorAll('p').forEach((p) => {
      if (p.classList.contains('button-container')) {
        p.classList.remove('button-container');
      }
    });
    row.replaceWith(details);
  });
}
