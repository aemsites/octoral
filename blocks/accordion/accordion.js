/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    // decorate accordion item body
    const check = !!row.children[1];
    const body = row.children[1];
    if (body) {
      body.className = 'accordion-item-body';
      if (!hasWrapper(body)) {
        body.innerHTML = `<p>${body.innerHTML}</p>`;
      }
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
