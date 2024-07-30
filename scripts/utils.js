/**
 * Retrieves the path segments of the current window's pathname.
 * The pathname is split into segments by '/' (ignoring empty segments),
 * and the segments are returned as an array.
 * @returns {string[]} An array of path segments.
 */
export default function getPathSegments() {
  return window.location.pathname.split('/')
    .filter((segment) => segment);
}
