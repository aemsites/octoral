/**
 * Retrieves the path segments of the current window's pathname.
 * The pathname is split into segments by '/' (ignoring empty segments),
 * and the segments are returned as an array.
 * @returns {string[]} An array of path segments.
 */
export function getPathSegments() {
  return window.location.pathname.split('/')
    .filter((segment) => segment);
}

export function normalizeString(str) {
  return str.toLowerCase().replace(/ /g, '_');
}

function sanitizeFilename(name) {
  if (!name) return '';
  return decodeURIComponent(name).toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizePath(path) {
  if (!path) return '';
  const extension = path.split('.').pop();
  const pathname = extension !== path ? path.substring(0, path.lastIndexOf('.')) : path;
  let sanitizedPath = '';
  pathname.split('/').forEach((p) => {
    if (p !== '') {
      sanitizedPath += `/${sanitizeFilename(p)}`;
    }
  });
  if (extension !== path) {
    sanitizedPath += `.${extension}`;
  }
  return sanitizedPath;
}
