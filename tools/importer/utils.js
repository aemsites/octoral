/* global WebImporter */

const PREVIEW_DOMAIN = 'https://main--octoral--aemsites.hlx.page';
const ORIGINAL_URL = 'https://www.octoral.com';

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
    el.src = img.content.replaceAll(ORIGINAL_URL, '');
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
    const url = new URL(a.href);
    if (url.pathname) {
      a.href = PREVIEW_DOMAIN + url.pathname;
    }
  });
};

export const getPathSegments = (url) => (new URL(url)).pathname.split('/')
  .filter((segment) => segment);

export const normalizeString = (str) => str.toLowerCase().replace(/ /g, '_');

export const fetchAndParseDocument = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching and parsing document:', error);
  }
  return null;
};

export const fixImageLinks = (originalImagePath) => {
  const imageName = originalImagePath.split('/').pop();
  const prefix = '/products/assets/';
  // return PREVIEW_DOMAIN + WebImporter.FileUtils.sanitizePath(prefix + imageName);
  return PREVIEW_DOMAIN + prefix + imageName;
};

export const extractShortNewsUrl = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  let newPath = '';

  segments.forEach((segment) => {
    if (/^\d/.test(segment)) {
      const match = segment.match(/\d+/);
      newPath += `/${match[0]}`;
      return;
    }
    newPath += `/${segment}`;
  });

  return newPath;
};
