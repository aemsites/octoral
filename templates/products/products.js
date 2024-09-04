// eslint-disable-next-line no-unused-vars,no-empty-function
import { loadTemplate } from '../../scripts/scripts.js';
import { normalizeString, getPathSegments } from '../../scripts/utils.js';
import {
  div, h1, p, a, h2, span,
} from '../../scripts/dom-helpers.js';
import {
  createOptimizedPicture, buildBlock, decorateBlock, loadBlock,
} from '../../scripts/aem.js';

function normalizeImage(str) {
  const imagePath = '/products/assets/';
  return imagePath + str.toLowerCase().replace(/_/g, '-');
}

class Obj {
  // eslint-disable-next-line max-len
  constructor(type, typeimage, typelabel, image, href, label, desc, feedType, title, titleimage, titlelabel, subtitle, itemnr, perbox, volume, code, productname) {
    this.type = type;
    this.typeimage = typeimage;
    this.typelabel = typelabel;
    this.image = image;
    this.href = href;
    this.label = label;
    this.desc = desc;
    this.feedType = feedType;
    this.title = title;
    this.titleimage = titleimage;
    this.titlelabel = titlelabel;
    this.subtitle = subtitle;
    this.itemnr = itemnr;
    this.perbox = perbox;
    this.volume = volume;
    this.code = code;
    this.productname = productname;
  }
}

// Result parsers parse the query results into a format that can be used by the block builder for
// the specific block types
const resultParsers = {
  // Parse results into a cards block
  cards: (results, value) => {
    const blockContents = [];
    results.forEach((result) => {
      const row = [];
      const cardBody = div();
      const cardImage = createOptimizedPicture(result[`${value}image`]);
      const divTitle = div({ class: 'title' });
      divTitle.textContent = result[`${value}`];
      const path = a();
      path.href = window.location.origin + result.href;
      path.append(divTitle);
      cardBody.appendChild(path);
      row.push(cardBody);

      if (cardImage) {
        const pathImg = a();
        pathImg.href = window.location.origin + result.href;
        pathImg.append(cardImage);
        row.push(pathImg);
      }
      blockContents.push(row);
    });
    return blockContents;
  },

  productstable: (results) => {
    const blockContents = [];
    const row = [];

    const trowhead = div();
    const cellhead1 = div({ class: 'heading' }, 'Item nr.');
    trowhead.append(cellhead1);
    const cellhead2 = div({ class: 'heading' }, 'Code');
    trowhead.append(cellhead2);
    const cellhead3 = div({ class: 'heading' }, 'Product name');
    trowhead.append(cellhead3);
    const cellhead4 = div({ class: 'heading' }, 'Per box');
    trowhead.append(cellhead4);
    const cellhead5 = div({ class: 'heading' }, 'Volume');
    trowhead.append(cellhead5);
    const productnameStatus = results.filter((result) => result.productname);
    const codeStatus = results.filter((result) => result.code);
    results.forEach((result) => {
      const trow = div();
      const createCell = (data, className) => {
        if (data) {
          const cell = div({ class: className });
          cell.textContent = data;
          trow.append(cell);
        } else {
          const cell = div({ class: className });
          cell.textContent = '';
          trow.append(cell);
        }
      };
      createCell(result.itemnr, 'data');
      if (codeStatus.length > 0) {
        createCell(result.code, 'data');
      } else cellhead2.remove();
      if (productnameStatus.length > 0) {
        createCell(result.productname, 'data');
      } else cellhead3.remove();
      createCell(result.perbox, 'data');
      createCell(result.volume, 'data');

      row.push(trowhead);
      row.push(trow);
    });

    blockContents.push(row);
    return blockContents;
  },
};

// Checking 4th used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system/octobase_system_mixing_colours
const tillTitle = (data, vocCompliant, type, title, locale) => {
  const endResult = [];
  let obj = {};

  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant && normalizeString(entry.type) === type && normalizeString(entry.title) === title) {
      obj = new Obj(entry.type, normalizeImage(entry['type-image']), entry['type-label'], normalizeImage(entry.image), `/${locale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}/${normalizeString(entry.title)}`, entry['type-label'], entry['title-desc'], 'stage4-table', entry.title, normalizeImage(entry['title-image']), entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume, entry.code, entry['product-name']);
      endResult.push(obj);
    }
  });
  return endResult;
};

// Checking 2nd used case - https://www.octoral.com/en/products/non-voc/cleaning_agents
const tillType = (data, vocCompliant, type, locale) => {
  const endResult = [];
  const duplicates = [];
  let obj = {};

  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant && normalizeString(entry.type) === type) {
      if (!entry.title) {
        obj = new Obj(entry.type, normalizeImage(entry['type-image']), entry['type-label'], normalizeImage(entry.image), `/${locale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}`, entry['type-label'], entry['type-desc'], 'stage2-table', entry.title, normalizeImage(entry['title-image']), entry['title-label'], entry['sub-title'], entry['item-nr'], entry['per-box'], entry.volume);
        endResult.push(obj);
      } else if (!duplicates.includes(entry.title)) { // Checking 3rd used case - https://www.octoral.com/en/products/non-voc/mixing_colour_system
        duplicates.push(entry.title);
        obj = new Obj(entry.type, normalizeImage(entry['type-image']), entry['type-label'], normalizeImage(entry.image), `/${locale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}/${normalizeString(entry.title)}`, entry['type-label'], entry['type-desc'], 'stage3-card', entry.title, normalizeImage(entry['title-image']), entry['title-label']);
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

// Checking 1st used case - https://www.octoral.com/en/products/non-voc/
const tillVocCompliant = (data, vocCompliant, locale) => {
  const endResult = [];
  const duplicates = [];
  let obj = {};
  data.forEach((entry) => {
    if (entry['voc-compliant'] === vocCompliant) {
      if (!duplicates.includes(entry.type)) {
        duplicates.push(entry.type);
        obj = new Obj(entry.type, normalizeImage(entry['type-image']), entry['type-label'], normalizeImage(entry.image), `/${locale}/products/${entry['voc-compliant']}/${normalizeString(entry.type)}`, entry['voc-compliant-label'], entry['voc-compliant-desc'], 'stage1-card');
        endResult.push(obj);
      }
    }
  });
  return endResult;
};

let endResult = [];

async function fetchProducts(vocCompliant, type, title, locale = 'en') {
  window.placeholders = window.placeholders || {};
  const TRANSLATION_KEY = 'products';

  await window.placeholders;
  const json = window.placeholders[`${TRANSLATION_KEY}`][`${locale}`];

  if (type.length === 0 && title.length === 0) {
    endResult = tillVocCompliant(json.data, vocCompliant, locale);
  }

  if (type.length > 0 && title.length === 0) {
    endResult = tillType(json.data, vocCompliant, type, locale);
  }

  if (title.length > 0) {
    endResult = tillTitle(json.data, vocCompliant, type, title, locale);
  }
  return endResult;
}

// Grouping by subtitle for Used Cases 2 & 4
const groupBy = (array, key) => array.reduce((accum, current) => {
  if (!accum[current[key]]) {
    accum[current[key]] = [];
  }
  accum[current[key]].push(current);
  return accum;
}, {});

export default async function decorate(doc) {
  let locale = '';
  let vocCompliant = '';
  let type = '';
  let title = '';

  // extends default template
  await loadTemplate(doc, 'default');
  const $section = doc.querySelector('section');
  let $products = div();

  // get path segments for use in product display logic
  const [rawLocale, , rawVocCompliant, rawType, rawTitle] = getPathSegments();
  if (rawLocale) { locale = normalizeString(rawLocale); }
  if (rawVocCompliant) { vocCompliant = normalizeString(rawVocCompliant); }
  if (rawType) { type = normalizeString(rawType); }
  if (rawTitle) { title = normalizeString(rawTitle); }

  const result = await fetchProducts(vocCompliant, type, title, locale);
  const usedCase = result[0].feedType;

  // Taking care of the 1st & 3rd used cases
  if (usedCase === 'stage1-card' || usedCase === 'stage3-card') {
    $products = div(
      h1(`${result[0].label}`),
      p(`${result[0].desc}`),
    );
    const blockType = 'cards';
    result.sort((x, y) => x.type - y.type);
    const blockContents = usedCase === 'stage1-card' ? resultParsers[blockType](result, 'type') : resultParsers[blockType](result, 'title');
    const builtBlock = buildBlock(blockType, blockContents);
    const parentDiv = div(
      builtBlock,
    );
    $section.append($products);
    $section.append(parentDiv);
    decorateBlock(builtBlock);
    await loadBlock(builtBlock);
    builtBlock.classList.add('products');
  }

  // Taking care of the 2nd & 4th used cases
  if (usedCase === 'stage2-table' || usedCase === 'stage4-table') {
    $products = usedCase === 'stage2-table' ? div(
      h1(`${result[0].typelabel}`),
      p(`${result[0].desc}`),
    ) : div(
      h1(`${result[0].titlelabel}`),
      p(`${result[0].desc}`),
    );

    const blockType = 'productstable';
    $section.append($products);
    result.sort((x, y) => x.subtitle - y.subtitle);
    const subtitleArray = groupBy(result, 'subtitle');
    Object.keys(subtitleArray).forEach(async (key, idx) => {
      const productImage = createOptimizedPicture(subtitleArray[key][0].image);

      if (productImage) {
        productImage.addEventListener('click', () => {
          showModal(idx);
        });
      }
      subtitleArray[key].sort((x, y) => x.itemnr - y.itemnr);
      const blockContents = resultParsers[blockType](subtitleArray[key]);
      const builtBlock = buildBlock(blockType, blockContents);
      const productName = h2(key);
      const parentDiv = div(
        productName,
        builtBlock,
      );
      const mainDiv = div(
        { class: 'product-info' },
        productImage,
        parentDiv,
      );
      $section.append(mainDiv);
      decorateBlock(builtBlock);
      await loadBlock(builtBlock);
    });
  }
}

const showModal = (clickedIndex) => {
  const modal = document.querySelector('.image-modal');
  if (!modal) {
    createModal();
    createOverlay();
  }
  populateCarousel(clickedIndex);
  document.querySelector('.image-modal').style.display = 'block';
  document.querySelector('.overlay').style.display = 'block';
};

// Create modal and carousel structure
const createModal = () => {
  const modal = div(
    { class: 'image-modal' },
    div(
      { class: 'image-modal-content' },
      span({
        class: 'close',
        onclick: () => closeModal(),
      }),
      a({
        class: 'carousel-nav carousel-nav-prev',
        onclick: () => showSlides(-1),
      }),
      div({ class: 'image-carousel' }),
      a({
          class: 'carousel-nav carousel-nav-next',
          onclick: () => showSlides(1),
        }),
      div({ class: 'carousel-btn-thumbnails' }),
    ),
  );

  document.body.append(modal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  const thumbnailsContainer = document.createElement('div');
  thumbnailsContainer.id = 'thumbnailsContainer';
  thumbnailsContainer.style.textAlign = 'center';
  thumbnailsContainer.style.marginTop = '20px';
  thumbnailsContainer.style.display = 'flex';
  thumbnailsContainer.style.justifyContent = 'center';
  thumbnailsContainer.style.flexWrap = 'wrap';
};

const closeModal = () => {
  document.querySelector('.image-modal').style.display = 'none';
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

const createOverlay = () => {
  const overlay = div({ class: 'overlay' });
  document.body.appendChild(overlay);
};

// Populate carousel with images
const populateCarousel = (clickedIndex) => {
  const images = document.querySelectorAll('.product-info img');
  const carousel = document.querySelector('.image-carousel');
  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  const dotsContainer = document.querySelector('.carousel-btn-thumbnails');
  images.forEach((img, index) => {
    const slide = div(
      { class: `slide slide-${index}` },
      createOptimizedPicture(img.getAttribute('src'), '', true),
    );
    slide.style.display = index === clickedIndex ? 'block' : 'none';
    carousel.appendChild(slide);

    /*
    const thumbnail = createOptimizedPicture(img.getAttribute('src'));
    thumbnail.className = 'thumbnail';
    thumbnail.style.cursor = 'pointer';
    thumbnail.style.width = '5%';
    thumbnail.style.height = '10%';
    thumbnail.style.margin = '0 2px';
    thumbnail.onclick = () => { showSlides(index - slideIndex); };
    thumbnailsContainer.appendChild(thumbnail);
*/

    const dot = span({ class: `dot dot-${index}`, onclick: () => { showSlides(index - slideIndex); } });
    dot.style.backgroundColor = index === clickedIndex ? '#717171' : '#bbb';
    dotsContainer.appendChild(dot);
  });
  slideIndex = clickedIndex; // Set the initial slide index to the clicked image
};

// Show slides and update dots and thumbnails
let slideIndex = 0;
const showSlides = (n) => {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const thumbnails = document.querySelectorAll('.thumbnail');
  slideIndex += n;
  if (slideIndex >= slides.length) { slideIndex = 0; }
  if (slideIndex < 0) { slideIndex = slides.length - 1; }
  slides.forEach((slide, index) => {
    slide.style.display = index === slideIndex ? 'block' : 'none';
  });
  dots.forEach((dot, index) => {
    dot.style.backgroundColor = index === slideIndex ? '#717171' : '#bbb';
  });
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.style.opacity = index === slideIndex ? '1' : '0.6';
  });
};
