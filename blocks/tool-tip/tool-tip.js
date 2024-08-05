import { div } from '../../scripts/dom-helpers.js';

function createTip(row) {
  const $tip = div({ class: 'tip-info' });

  row.querySelectorAll(':scope > div').forEach((col, index) => {
    // decorate image
    if (index === 0) {      // first column = content
      col.classList.add('tip-col');
      $tip.append(col);
    } else if (index === 1) {
      // second column = markers

      // Regular expression to match the location and the x, y coordinates
      const regex = /([^,[\]]+)\s*\[(\d+px),\s*(\d+px)]/g;
      const markers = [];
      let match;

      // Use regex.exec in a loop to get all markers
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(col.textContent)) !== null) {
        const location = match[1].trim();
        const x = match[2];
        const y = match[3];
        markers.push({ location, x, y });
      }

      markers.forEach(({ location, x, y }) => {
        console.log(`Location: ${location}, X: ${x}, Y: ${y}`);
      });
    }
  });

  //  $slide.appendChild($slideWrapper);

  return $tip;
}

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');

  const image = rows[0].querySelector('img');

  const $tipContainer = div({ class: 'tips' });

  Array.from(rows).splice(1).forEach((row, i) => {
    // const index = i + 1;
    const $tip = createTip(row, i);
    console.log('row', i, row);
    $tipContainer.append($tip);
  });

  block.append($tipContainer);
}
