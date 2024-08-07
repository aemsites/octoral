/* eslint-disable function-paren-newline, object-curly-newline */
import { div, br } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function createTip(row, i) {
  const tipFrag = document.createDocumentFragment();
  const $tip = div({ class: 'info', id: `box${i}` });
  tipFrag.appendChild($tip);

  row.querySelectorAll(':scope > div').forEach((col, index) => {
    if (index === 0) { // first column = textual content
      $tip.innerHTML = col.innerHTML;
    } else if (index === 1) { // second column = marker data
      // Regex to match the location, x and y coordinates
      const regex = /([^,[\]]+)\s*\[(\d+px),\s*(\d+px)]/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(col.textContent)) !== null) {
        const location = match[1].trim();
        const x = match[2];
        const y = match[3];
        const $marker = div({
          class: 'pin', 'data-id': `box${i}`, title: location, style: ` top: ${x}; left: ${y};`,
        });
        tipFrag.appendChild($marker);
      }
    }
  });
  return tipFrag;
}

function fade(dir, el) {
  if (dir === 'in') {
    el.style.visibility = 'visible';
    el.classList.add('fade-in');
  } else {
    el.classList.remove('fade-in');
    setTimeout(() => { el.style.visibility = 'hidden'; }, 1600);
  }
}

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  const $image = createOptimizedPicture(rows[0].querySelector('img').src, 'title', true, [{ width: '600' }]);
  const $tips = div({ class: 'tips' });

  Array.from(rows)
    .splice(1)
    .forEach((row, i) => {
      const $tip = createTip(row, i);
      $tips.append($tip);
    });

  const $canvas = document.createElement('canvas');
  $canvas.width = 580;
  $canvas.height = 538;

  const $intro = div({ class: 'intro' },
    'Click a pointer on the map',
    br(),
    'to show information about the agency.',
  );

  block.replaceWith($image, $tips, $canvas, $intro);

  if ($intro) {
    setTimeout(() => {
      fade('in', $intro);
    }, 100);
    setTimeout(() => {
      fade('out', $intro);
    }, 4000);
  }

  const ctx = $canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);

  // create clickable canvas
  if ($tips) {
    const $pins = $tips.querySelectorAll('.pin');

    const clearCanvas = () => {
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    };

    const clearAll = () => {
      if ($intro.style.visibility === 'visible')fade('out', $intro);
      clearCanvas();
      const activeItems = $tips.querySelectorAll('.active');
      activeItems.forEach((item) => {
        item.classList.remove('active');
      });
    };

    const drawCanvas = (boxID, clear) => {
      const aBox = document.getElementById(boxID);
      const aPins = document.querySelectorAll(`[data-id="${boxID}"]`);

      if (clear) clearCanvas();
      else clearAll();

      // set box active and get position
      aBox.classList.add('active');
      const aBoxRect = {
        left: parseInt(window.getComputedStyle(aBox).left, 10),
        top: parseInt(window.getComputedStyle(aBox).top, 10),
        height: parseInt(window.getComputedStyle(aBox).height, 10),
        width: parseInt(window.getComputedStyle(aBox).width, 10),
        center: {
          left: parseInt(window.getComputedStyle(aBox).left, 10)
            + (parseInt(window.getComputedStyle(aBox).width, 10) / 2),
          top: parseInt(window.getComputedStyle(aBox).top, 10)
            + (parseInt(window.getComputedStyle(aBox).height, 10) / 2),
        },
      };

      // set pin active and draw lines
      aPins.forEach((pin) => {
        pin.classList.add('active');
        const x = parseInt(pin.style.left, 10);
        const y = parseInt(pin.style.top, 10);
        ctx.strokeStyle = 'rgba(254,138,2,1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(aBoxRect.center.left, aBoxRect.center.top);
        ctx.stroke();
        ctx.closePath();
      });
    };

    // add listeners
    $canvas.addEventListener('click', clearAll);

    const $infoBoxes = $tips.querySelectorAll('.info');

    // prevent info boxes from closing when clicked
    $infoBoxes.forEach((item) => item.addEventListener('click', (e) => e.stopPropagation()));

    $pins.forEach((pin) => {
      pin.addEventListener('click', (e) => {
        drawCanvas(pin.getAttribute('data-id'));
        e.stopPropagation();
      });
    });
  }

  ctx.restore();
}
