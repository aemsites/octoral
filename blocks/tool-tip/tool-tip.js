import { div, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function createTip(row, i) {
  const tipFrag = document.createDocumentFragment();

  // Create the tip-info element
  const $tip = div({ class: 'agencieinfo', id: `box${i}` });
  tipFrag.appendChild($tip);

  row.querySelectorAll(':scope > div').forEach((col, index) => {
    if (index === 0) { // first column = textual content
      $tip.appendChild(col);
    } else if (index === 1) { // second column = marker data
      // Regex to match the location, x and y coordinates
      const regex = /([^,[\]]+)\s*\[(\d+px),\s*(\d+px)]/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(col.textContent)) !== null) {
        const location = match[1].trim();
        const x = match[2];
        const y = match[3];
        const $marker = a({ class: 'pointer', title: location, style: ` top: ${x}; left: ${y};` });
        tipFrag.appendChild($marker);
      }
    }
  });
  return tipFrag;
}


function mapStuff(block, $welcomebox, $canvas) {

  // document.addEventListener('DOMContentLoaded', () => {

  const _boxes = {
    box1: ['us', 'southus'],
    box2: ['eu', 'af', 'ru'],
    box3: ['dubai'],
    box5: ['aus', 'asia'],
  };

  const _pointers = {
    us: [80, 80],
    southus: [150, 220],
    eu: [268, 58],
    dubai: [340, 120],
    aus: [506, 237],
    af: [300, 150],
    asia: [400, 126],
    ru: [300, 30],
  };


  // Function to fade in an element
  function fadeIn(element, opacity) {
    let op = 0; // initial opacity
    const timer = setInterval(() => {
      if (op >= opacity) {
        clearInterval(timer);
        element.style.opacity = opacity;
      }
      element.style.opacity = op;
      op += 0.05;
    }, 50);
  }

  // Function to fade out an element
  function fadeOut(element, opacity) {
    let op = 1; // initial opacity
    const timer = setInterval(() => {
      if (op <= opacity) {
        clearInterval(timer);
        element.style.opacity = opacity;
      }
      element.style.opacity = op;
      op -= 0.05;
    }, 50);
  }

  if ($welcomebox) {
    fadeIn($welcomebox, 0.6);
    setTimeout(() => {
      fadeOut($welcomebox, 0);
    }, 4000);
  }

  const ctx = $canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);

  const agencies = document.querySelector('.tips');
  if (agencies) {
    const pointers = agencies.querySelectorAll('.pointer');

    console.log(pointers);
    function clearCanvas() {
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    }

    function clearAll() {
      if ($welcomebox) fadeOut($welcomebox, 0);
      clearCanvas();
      const agencieInfos = agencies.querySelectorAll('.agencieinfo');
      agencieInfos.forEach((item) => {
        item.style.visibility = 'hidden';
      });
      pointers.forEach((pointer) => {
        pointer.classList.remove('active');
      });
    }

    function drawCanvas(box, clearCanvas) {
      console.log('box', box);
      if (clearCanvas) {
        clearCanvas();
      } else {
        clearAll();
      }

      box.style.visibility = 'visible';

      const boxRect = {
        left: parseInt(window.getComputedStyle(box).left, 10),
        top: parseInt(window.getComputedStyle(box).top, 10),
        height: parseInt(window.getComputedStyle(box).height, 10),
        width: parseInt(window.getComputedStyle(box).width, 10),
        center: {
          // eslint-disable-next-line max-len
          left: parseInt(window.getComputedStyle(box).left, 10) + (parseInt(window.getComputedStyle(box).width, 10) / 2),
          // eslint-disable-next-line max-len
          top: parseInt(window.getComputedStyle(box).top, 10) + (parseInt(window.getComputedStyle(box).height, 10) / 2),
        },
      };



      _boxes[box.id].forEach((item) => {
        ctx.strokeStyle = 'rgba(254,138,2,1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(_pointers[item][0] + 5, _pointers[item][1] + 5);
        ctx.lineTo(boxRect.center.left, boxRect.center.top);
        ctx.stroke();
        ctx.closePath();

        document.getElementById(item)
          .classList
          .add('active');
      });
    }

    const agencieInfos = agencies.querySelectorAll('.agencieinfo');


    agencieInfos.forEach((item) => {
      console.log('items', item.innerHTML);
      item.dataset.initPos = JSON.stringify({
        left: window.getComputedStyle(item).left,
        top: window.getComputedStyle(item).top,
      });

      // Assuming you want drag functionality, you may need to use a library or implement it
      // For native drag-and-drop, you'll have to use the HTML5 Drag and Drop API or similar
      item.addEventListener('drag', () => {
        drawCanvas(item, true);
      });
    });

    agencies.addEventListener('click', clearAll);
    agencieInfos.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    pointers.forEach((pointer) => {
      pointer.addEventListener('click', (e) => {
        let boxName;

        Object.keys(_boxes)
          .forEach((key) => {
            if (_boxes[key].includes(pointer.id)) {
              boxName = key;
            }
          });

        console.log('boxName', boxName);
        const box = document.getElementById(boxName);
        drawCanvas(box);
        e.stopPropagation();
      });
    });
  }

  ctx.restore();
  // });

}


export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');

  // block add id agencies
  block.id = 'agencies';

  const $image = createOptimizedPicture(rows[0].querySelector('img').src, 'title', true, [{ width: '600' }]);

  const $tipContainer = div({ class: 'tips' });

  Array.from(rows)
    .splice(1)
    .forEach((row, i) => {
      const $tip = createTip(row, i);
      $tipContainer.append($tip);
    });

  const $canvas = document.createElement('canvas');
  $canvas.id = 'canvas';
  $canvas.width = 580;
  $canvas.height = 538;

  const $welcomebox = div({ id: 'welcomebox' },
    'Click a pointer on the map to show information about the agency.',
  );

  block.replaceWith($image, $tipContainer, $canvas, $welcomebox);

  // set timeout for 1 second
  setTimeout(() => {
    mapStuff(block, $welcomebox, $canvas);
  }, 1000);

}
