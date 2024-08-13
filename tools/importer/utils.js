/* global WebImporter */

export const createMetadata = (main, document, params) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.textContent.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content.replaceAll('https://www.octoral.com', '');
    meta.Image = el;
  }

  if (params.preProcessMetadata && Object.keys(params.preProcessMetadata).length) {
    Object.assign(meta, params.preProcessMetadata);
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

export const fixRelativeLinks = (document) => {
  document.querySelectorAll('a').forEach((a) => {
    const targetDomain = 'https://main--octoral--aemsites.hlx.page';
    const url = new URL(a.href);
    if (url.pathname) {
      a.href = targetDomain + url.pathname;
    }
  });
};

export const getPathSegments = (url) => (new URL(url)).pathname.split('/')
  .filter((segment) => segment);

export const normalizeString = (str) => {
  return str.toLowerCase().replace(/ /g, '_');
}

export const fetchAndParseDocument = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc;
  } catch (error) {
    console.error('Error fetching and parsing document:', error);
  }
};

