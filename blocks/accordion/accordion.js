import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
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
          const childBody = div();
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
    row.replaceWith(details);
  });
}
